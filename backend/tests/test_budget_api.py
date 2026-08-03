import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock
from uuid import uuid4
from main import app
from app.api.v1.budget import get_budget_service
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.enums import BudgetPeriod

client = TestClient(app)

def mock_get_current_user():
    user = User(email="test@example.com", is_active=True)
    user.id = uuid4()
    return user

@pytest.fixture
def mock_service():
    service = AsyncMock()
    app.dependency_overrides[get_budget_service] = lambda: service
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield service
    app.dependency_overrides.clear()

def test_list_budget_api(mock_service):
    mock_service.list_budgets.return_value = []
    response = client.get("/api/v1/budget")
    assert response.status_code == 200
    assert response.json() == []

def test_create_budget_api(mock_service):
    mock_budget = {
        "id": str(uuid4()),
        "user_id": str(uuid4()),
        "amount": 500.0,
        "period": "MONTHLY",
        "category_id": str(uuid4()),
        "created_at": "2024-01-01T12:00:00",
        "updated_at": "2024-01-01T12:00:00"
    }
    
    mock_service.create_budget.return_value = mock_budget
    
    payload = {
        "amount": 500.0,
        "period": "MONTHLY",
        "category_id": str(uuid4())
    }
    
    response = client.post("/api/v1/budget", json=payload)
    assert response.status_code == 201
    assert response.json()["amount"] == 500.0
