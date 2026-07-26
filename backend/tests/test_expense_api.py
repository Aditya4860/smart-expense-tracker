import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock
from uuid import uuid4
from datetime import date
from app.main import app
from app.api.v1.expense import get_expense_service
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
    app.dependency_overrides[get_expense_service] = lambda: service
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield service
    app.dependency_overrides.clear()

def test_list_expenses_api(mock_service):
    mock_service.list_expenses.return_value = []
    response = client.get("/api/v1/expenses")
    assert response.status_code == 200
    assert response.json() == []

def test_create_expense_api(mock_service):
    mock_expense = {
        "id": str(uuid4()),
        "user_id": str(uuid4()),
        "title": "Groceries",
        "description": "Weekly groceries",
        "amount": 50.0,
        "category": "Food",
        "payment_method": "Card",
        "transaction_date": str(date.today()),
        "created_at": "2024-01-01T12:00:00",
        "updated_at": "2024-01-01T12:00:00"
    }
    
    mock_service.create_expense.return_value = mock_expense
    
    payload = {
        "title": "Groceries",
        "amount": 50.0,
        "category": "Food",
        "transaction_date": str(date.today())
    }
    
    response = client.post("/api/v1/expenses", json=payload)
    assert response.status_code == 201
    assert response.json()["title"] == "Groceries"

def test_get_expense_api(mock_service):
    mock_expense = {
        "id": "123",
        "user_id": str(uuid4()),
        "title": "Gas",
        "amount": 30.0,
        "category": "Transport",
        "transaction_date": str(date.today()),
        "created_at": "2024-01-01T12:00:00",
        "updated_at": "2024-01-01T12:00:00"
    }
    mock_service.get_expense.return_value = mock_expense
    
    response = client.get("/api/v1/expenses/123")
    assert response.status_code == 200
    assert response.json()["title"] == "Gas"

def test_delete_expense_api(mock_service):
    mock_service.delete_expense.return_value = True
    response = client.delete("/api/v1/expenses/123")
    assert response.status_code == 204

def test_search_expenses_api(mock_service):
    mock_service.search_expenses.return_value = []
    response = client.get("/api/v1/expenses/search?q=coffee")
    assert response.status_code == 200
    assert response.json() == []

def test_statistics_api(mock_service):
    mock_service.get_statistics.return_value = {"total_amount": 100.0}
    response = client.get("/api/v1/expenses/statistics?start_date=2024-01-01&end_date=2024-01-31")
    assert response.status_code == 200
    assert response.json() == {"total_amount": 100.0}
