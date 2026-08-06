import pytest
from datetime import timedelta
from uuid import uuid4
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock

from main import app
from app.core.security import create_access_token, create_refresh_token, verify_password, get_password_hash
from app.core.rate_limiter import get_rate_limiter
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.expense_schema import ExpenseCreate
from app.schemas.user import UserCreate
from app.schemas.category_schema import CategoryCreate
from pydantic import ValidationError

client = TestClient(app)

def test_password_complexity_schema_validation():
    """Verify that UserCreate pydantic schema enforces password complexity."""
    # Too short (< 8 chars)
    with pytest.raises(ValidationError) as exc:
        UserCreate(email="user@example.com", full_name="John Doe", password="Short1!")
    assert "at least 8 characters" in str(exc.value)

    # Missing uppercase
    with pytest.raises(ValidationError) as exc:
        UserCreate(email="user@example.com", full_name="John Doe", password="lowercase123!")
    assert "uppercase" in str(exc.value)

    # Missing lowercase
    with pytest.raises(ValidationError) as exc:
        UserCreate(email="user@example.com", full_name="John Doe", password="UPPERCASE123!")
    assert "lowercase" in str(exc.value)

    # Missing digit
    with pytest.raises(ValidationError) as exc:
        UserCreate(email="user@example.com", full_name="John Doe", password="NoDigitsHere!!")
    assert "digit" in str(exc.value)

    # Missing special character
    with pytest.raises(ValidationError) as exc:
        UserCreate(email="user@example.com", full_name="John Doe", password="NoSpecialChar123")
    assert "special character" in str(exc.value)

    # Valid password
    valid = UserCreate(email="user@example.com", full_name="John Doe", password="StrongPassword123!")
    assert valid.password == "StrongPassword123!"


def test_password_hashing_and_verification():
    """Ensure passwords hash properly and constant-time verification succeeds."""
    password = "MySecurePassword123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False


def test_security_headers_present():
    """Verify that all responses include strict security headers."""
    response = client.get("/health")
    assert response.status_code in (200, 503)
    headers = response.headers
    assert headers.get("x-content-type-options") == "nosniff"
    assert headers.get("x-frame-options") == "DENY"
    assert headers.get("x-xss-protection") == "0"
    assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert "default-src 'self'" in headers.get("content-security-policy", "")


def test_rate_limiting_on_auth_endpoints():
    """Verify that hammering the login endpoint triggers 429 Too Many Requests."""
    from app.services.auth_service import AuthService
    from app.core.exceptions import UnauthorizedException
    from unittest.mock import patch

    limiter = get_rate_limiter()
    limiter.reset()

    try:
        with patch.object(AuthService, "authenticate_user", side_effect=UnauthorizedException("Incorrect email or password")):
            responses = []
            # Limit is 5 requests per 60 seconds
            for _ in range(7):
                resp = client.post(
                    "/api/v1/auth/login",
                    json={"email": "attacker@example.com", "password": "BadPassword123!"}
                )
                responses.append(resp)

            # First 5 should not be 429 (they will be 401 Unauthorized)
            for r in responses[:5]:
                assert r.status_code == 401

            # 6th and 7th should be 429 Too Many Requests
            assert responses[5].status_code == 429
            assert responses[6].status_code == 429
            assert "retry-after" in responses[5].headers
            data = responses[5].json()
            assert data["success"] is False
            assert "Too many requests" in data["message"]
    finally:
        limiter.reset()


def test_token_type_enforcement_and_expiration():
    """Verify JWT access and refresh token strictness and expiration."""
    user_id = str(uuid4())
    
    # 1. Create a refresh token
    refresh_tok = create_refresh_token(subject=user_id)

    # 2. Try to use refresh token as Bearer token on protected route -> 401
    resp = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {refresh_tok}"}
    )
    assert resp.status_code == 401
    assert "Invalid token type" in resp.json()["message"]

    # 3. Create an expired access token -> 401
    expired_tok = create_access_token(subject=user_id, expires_delta=timedelta(seconds=-10))
    resp = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {expired_tok}"}
    )
    assert resp.status_code == 401
    assert "expired" in resp.json()["message"].lower()

    # 4. Tampered token -> 401
    tampered_tok = expired_tok + "tampered"
    resp = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {tampered_tok}"}
    )
    assert resp.status_code == 401


def test_input_sanitization_xss_prevention():
    """Verify that malicious script tags, event handlers, and null bytes are sanitized in schemas."""
    from app.models.enums import TransactionType
    # Test Expense schema sanitization
    cat_id = uuid4()
    expense = ExpenseCreate(
        merchant="<script>alert('XSS')</script>Starbucks Coffee\x00",
        description="<img src=x onerror=alert(1)>Morning espresso",
        amount=5.50,
        category_id=cat_id,
        date="2026-08-04"
    )
    assert "<script>" not in expense.merchant
    assert "alert('XSS')" not in expense.merchant
    assert "\x00" not in expense.merchant
    assert expense.merchant == "Starbucks Coffee"
    assert "<img" not in expense.description
    assert "onerror=" not in expense.description
    assert "Morning espresso" in expense.description

    # Test Category schema sanitization
    cat = CategoryCreate(
        name="<iframe src='http://evil.com'></iframe>Entertainment",
        type=TransactionType.EXPENSE,
        icon="<svg onload=alert(1)>icon-food",
        color="#ff0000"
    )
    assert "<iframe" not in cat.name
    assert "Entertainment" in cat.name
    assert "<svg" not in (cat.icon or "")
    assert "icon-food" in (cat.icon or "")


def test_error_response_envelope_standardization():
    """Verify that unhandled routes and validation errors return standard JSON envelopes."""
    # 404 Not Found
    resp = client.get("/api/v1/nonexistent-endpoint")
    assert resp.status_code == 404
    data = resp.json()
    assert data["success"] is False
    assert "message" in data

    # 422 Validation Error
    resp = client.post("/api/v1/auth/login", json={"invalid_field": 123})
    assert resp.status_code == 422
    data = resp.json()
    assert data["success"] is False
    assert data["message"] == "Validation Error"
    assert isinstance(data["errors"], list)
