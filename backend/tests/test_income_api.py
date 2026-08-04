import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock
from uuid import uuid4
from datetime import date
from main import app
from app.api.v1.income import get_income_service
from app.core.dependencies import get_current_user
from app.models.user import User

client = TestClient(app)

def mock_get_current_user():
    user = User(email="test@example.com", is_active=True)
    user.id = uuid4()
    return user

@pytest.fixture
def mock_service():
    service = AsyncMock()
    app.dependency_overrides[get_income_service] = lambda: service
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield service
    app.dependency_overrides.clear()

def test_list_income_api(mock_service):
    mock_service.list_incomes.return_value = []
    response = client.get("/api/v1/income")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"] == []

def test_create_income_api(mock_service):
    mock_income = {
        "id": str(uuid4()),
        "user_id": str(uuid4()),
        "amount": 100.0,
        "date": str(date.today()),
        "source": "Salary",
        "category_id": str(uuid4()),
        "created_at": "2024-01-01T12:00:00",
        "updated_at": "2024-01-01T12:00:00"
    }
    
    mock_service.create_income.return_value = mock_income
    
    payload = {
        "amount": 100.0,
        "date": str(date.today()),
        "source": "Salary",
        "category_id": str(uuid4())
    }
    
    response = client.post("/api/v1/income", json=payload)
    assert response.status_code == 201
    assert response.json()["success"] is True
    assert response.json()["data"]["source"] == "Salary"
