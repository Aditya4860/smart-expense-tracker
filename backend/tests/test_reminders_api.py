import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock
from uuid import uuid4
from datetime import date
from main import app
from app.api.v1.reminders import get_reminder_service
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
    app.dependency_overrides[get_reminder_service] = lambda: service
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield service
    app.dependency_overrides.clear()

def test_list_reminders_api(mock_service):
    mock_service.list_reminders.return_value = []
    response = client.get("/api/v1/reminders")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"] == []

def test_create_reminder_api(mock_service):
    rem_id = str(uuid4())
    mock_data = {
        "id": rem_id,
        "user_id": str(uuid4()),
        "title": "Electricity Bill",
        "description": "Due for July",
        "amount": 1850.0,
        "type": "BILL",
        "frequency": "MONTHLY",
        "due_date": "2026-08-15",
        "due_time": "10:00",
        "category_id": None,
        "is_auto_notified": True,
        "status": "PENDING",
        "is_overdue": False,
        "created_at": "2026-08-01T00:00:00",
        "updated_at": "2026-08-01T00:00:00",
        "history": [],
    }
    mock_service.create_reminder.return_value = mock_data

    payload = {
        "title": "Electricity Bill",
        "description": "Due for July",
        "amount": 1850.0,
        "type": "BILL",
        "frequency": "MONTHLY",
        "due_date": "2026-08-15",
        "due_time": "10:00",
    }

    response = client.post("/api/v1/reminders", json=payload)
    assert response.status_code == 201
    assert response.json()["success"] is True
    assert response.json()["data"]["title"] == "Electricity Bill"

def test_get_reminder_counts_api(mock_service):
    mock_service.get_counts.return_value = {
        "pending_count": 4,
        "overdue_count": 1,
        "completed_count": 8,
        "total_count": 13,
    }
    response = client.get("/api/v1/reminders/counts")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["pending_count"] == 4

def test_complete_reminder_api(mock_service):
    rem_id = uuid4()
    mock_service.complete_reminder.return_value = {
        "id": str(rem_id),
        "user_id": str(uuid4()),
        "title": "Netflix",
        "amount": 649.0,
        "type": "SUBSCRIPTION",
        "frequency": "ONCE",
        "due_date": "2026-08-10",
        "status": "COMPLETED",
        "is_auto_notified": True,
        "created_at": "2026-08-01T00:00:00",
        "updated_at": "2026-08-01T00:00:00",
        "history": [],
    }
    response = client.post(f"/api/v1/reminders/{rem_id}/complete")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["status"] == "COMPLETED"

def test_snooze_reminder_api(mock_service):
    rem_id = uuid4()
    mock_service.snooze_reminder.return_value = {
        "id": str(rem_id),
        "user_id": str(uuid4()),
        "title": "Car EMI",
        "amount": 12000.0,
        "type": "EMI",
        "frequency": "MONTHLY",
        "due_date": "2026-08-10",
        "status": "SNOOZED",
        "snooze_until": "2026-08-12",
        "is_auto_notified": True,
        "created_at": "2026-08-01T00:00:00",
        "updated_at": "2026-08-01T00:00:00",
        "history": [],
    }
    response = client.post(f"/api/v1/reminders/{rem_id}/snooze", json={"days": 2})
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["status"] == "SNOOZED"

def test_process_due_reminders_api(mock_service):
    mock_service.process_due_reminders.return_value = {
        "notified_count": 1,
        "processed_reminders": [],
        "messages": ["Notified for 1 reminder"],
    }
    response = client.post("/api/v1/reminders/process-due")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["notified_count"] == 1
