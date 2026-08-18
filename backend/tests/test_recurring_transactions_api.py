import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock
from uuid import uuid4
from datetime import date
from main import app
from app.api.v1.recurring_transactions import get_recurring_service
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
    app.dependency_overrides[get_recurring_service] = lambda: service
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield service
    app.dependency_overrides.clear()

def test_list_recurring_transactions_api(mock_service):
    mock_service.list_recurring_transactions.return_value = []
    response = client.get("/api/v1/recurring-transactions")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"] == []

def test_create_recurring_transaction_api(mock_service):
    cat_id = str(uuid4())
    mock_data = {
        "id": str(uuid4()),
        "user_id": str(uuid4()),
        "type": "EXPENSE",
        "amount": 2500.0,
        "frequency": "MONTHLY",
        "category_id": cat_id,
        "title": "Internet Bill",
        "description": "High speed fiber",
        "merchant": "Airtel",
        "payment_method": "Auto-debit",
        "start_date": "2026-08-01",
        "end_date": None,
        "is_never_ending": True,
        "next_date": "2026-08-01",
        "last_processed_date": None,
        "status": "ACTIVE",
        "auto_process": True,
        "created_at": "2026-08-01T00:00:00",
        "updated_at": "2026-08-01T00:00:00",
        "category_name": "Utilities",
    }
    mock_service.create_recurring_transaction.return_value = mock_data

    payload = {
        "type": "EXPENSE",
        "amount": 2500.0,
        "frequency": "MONTHLY",
        "category_id": cat_id,
        "title": "Internet Bill",
        "description": "High speed fiber",
        "merchant": "Airtel",
        "payment_method": "Auto-debit",
        "start_date": "2026-08-01",
    }

    response = client.post("/api/v1/recurring-transactions", json=payload)
    assert response.status_code == 201
    assert response.json()["success"] is True
    assert response.json()["data"]["title"] == "Internet Bill"

def test_get_recurring_counts_api(mock_service):
    mock_service.get_counts.return_value = {
        "active_count": 5,
        "paused_count": 1,
        "total_count": 6,
        "total_active": 5,
        "active_expenses": 3,
        "active_income": 2,
        "cancelled_count": 0,
        "total_monthly_recurring_expense": 5000.0,
        "total_monthly_recurring_income": 10000.0,
    }
    response = client.get("/api/v1/recurring-transactions/counts")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["active_count"] == 5

def test_pause_recurring_api(mock_service):
    rec_id = uuid4()
    mock_service.pause_recurring_transaction.return_value = {
        "id": str(rec_id),
        "user_id": str(uuid4()),
        "type": "EXPENSE",
        "amount": 1000.0,
        "frequency": "MONTHLY",
        "category_id": str(uuid4()),
        "title": "Gym",
        "start_date": "2026-08-01",
        "next_date": "2026-09-01",
        "status": "PAUSED",
        "is_never_ending": True,
        "auto_process": True,
        "created_at": "2026-08-01T00:00:00",
        "updated_at": "2026-08-01T00:00:00",
    }
    response = client.post(f"/api/v1/recurring-transactions/{rec_id}/pause")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["status"] == "PAUSED"

def test_resume_recurring_api(mock_service):
    rec_id = uuid4()
    mock_service.resume_recurring_transaction.return_value = {
        "id": str(rec_id),
        "user_id": str(uuid4()),
        "type": "EXPENSE",
        "amount": 1000.0,
        "frequency": "MONTHLY",
        "category_id": str(uuid4()),
        "title": "Gym",
        "start_date": "2026-08-01",
        "next_date": "2026-09-01",
        "status": "ACTIVE",
        "is_never_ending": True,
        "auto_process": True,
        "created_at": "2026-08-01T00:00:00",
        "updated_at": "2026-08-01T00:00:00",
    }
    response = client.post(f"/api/v1/recurring-transactions/{rec_id}/resume")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["status"] == "ACTIVE"

def test_skip_recurring_api(mock_service):
    rec_id = uuid4()
    mock_service.skip_occurrence.return_value = {
        "id": str(rec_id),
        "user_id": str(uuid4()),
        "type": "EXPENSE",
        "amount": 1000.0,
        "frequency": "MONTHLY",
        "category_id": str(uuid4()),
        "title": "Gym",
        "start_date": "2026-08-01",
        "next_date": "2026-10-01",
        "status": "ACTIVE",
        "is_never_ending": True,
        "auto_process": True,
        "created_at": "2026-08-01T00:00:00",
        "updated_at": "2026-08-01T00:00:00",
    }
    response = client.post(f"/api/v1/recurring-transactions/{rec_id}/skip")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["next_date"] == "2026-10-01"

def test_process_due_api(mock_service):
    mock_service.process_all_due.return_value = {
        "processed_count": 2,
        "generated_transactions": [],
        "messages": ["Processed 2 schedules"],
    }
    response = client.post("/api/v1/recurring-transactions/process-due")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["processed_count"] == 2
