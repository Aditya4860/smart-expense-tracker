import pytest
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock

from app.services.oauth_service import OAuthService
from app.models.user import User
from app.models.oauth_code import OAuthCode
from app.core.exceptions import UnauthorizedException

@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.commit = AsyncMock()
    db.rollback = AsyncMock()
    db.refresh = AsyncMock()
    db.add = MagicMock()
    return db

@pytest.fixture
def oauth_service(mock_db):
    return OAuthService(db=mock_db)

@pytest.mark.asyncio
async def test_get_or_create_google_user_existing_google(oauth_service, mock_db):
    # 1. Check if user exists by google_id
    existing_user = User(
        id=uuid4(),
        email="existing@example.com",
        auth_provider="google",
        provider_id="google_123",
        full_name="Existing User"
    )
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = existing_user
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    user = await oauth_service.get_or_create_google_user("google_123", "existing@example.com", "Existing User")

    assert user.email == "existing@example.com"
    assert user.provider_id == "google_123"

@pytest.mark.asyncio
async def test_generate_one_time_code(oauth_service, mock_db):
    user_id = str(uuid4())
    raw_code = await oauth_service.generate_one_time_code(user_id)
    
    assert len(raw_code) == 86 # secrets.token_urlsafe(64) is 86 chars
    assert mock_db.add.called
    assert mock_db.commit.called

@pytest.mark.asyncio
async def test_exchange_code_success(oauth_service, mock_db):
    # Setup mock for finding the oauth_code
    oauth_code = OAuthCode(
        id=uuid4(),
        code_hash="mock_hash", # This doesn't matter for the mock result
        user_id=uuid4(),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
        used=False
    )
    
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = oauth_code
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    tokens = await oauth_service.exchange_code("any_raw_code")
    
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert oauth_code.used is True
    assert mock_db.commit.called

@pytest.mark.asyncio
async def test_exchange_code_invalid(oauth_service, mock_db):
    # Not found in DB
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = None
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    with pytest.raises(UnauthorizedException) as exc_info:
        await oauth_service.exchange_code("invalid_raw_code")
        
    assert "Invalid or expired authorization code" in str(exc_info.value.detail)

@pytest.mark.asyncio
async def test_exchange_code_expired(oauth_service, mock_db):
    oauth_code = OAuthCode(
        id=uuid4(),
        code_hash="mock_hash",
        user_id=uuid4(),
        expires_at=datetime.now(timezone.utc) - timedelta(minutes=5), # Expired 5 mins ago
        used=False
    )
    
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = oauth_code
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    with pytest.raises(UnauthorizedException) as exc_info:
        await oauth_service.exchange_code("expired_code")
        
    assert "Authorization code has expired" in str(exc_info.value.detail)

@pytest.mark.asyncio
async def test_exchange_code_already_used(oauth_service, mock_db):
    oauth_code = OAuthCode(
        id=uuid4(),
        code_hash="mock_hash",
        user_id=uuid4(),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
        used=True # Already used
    )
    
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = oauth_code
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    with pytest.raises(UnauthorizedException) as exc_info:
        await oauth_service.exchange_code("used_code")
        
    assert "already been used" in str(exc_info.value.detail)
