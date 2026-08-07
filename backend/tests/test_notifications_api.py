import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock
from uuid import uuid4
from main import app
from app.api.v1.notifications import get_notification_service
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
    app.dependency_overrides[get_notification_service] = lambda: service
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield service
    app.dependency_overrides.clear()

def test_list_notifications_api(mock_service):
    mock_service.list_notifications.return_value = []
    response = client.get("/api/v1/notifications")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"] == []

def test_create_notification_api(mock_service):
    mock_notification = {
        "id": str(uuid4()),
        "user_id": str(uuid4()),
        "title": "Welcome",
        "message": "Welcome to Smart Expense Tracker",
        "is_read": False,
        "created_at": "2024-01-01T12:00:00",
        "updated_at": "2024-01-01T12:00:00"
    }
    
    mock_service.create_notification.return_value = mock_notification
    
    payload = {
        "title": "Welcome",
        "message": "Welcome to Smart Expense Tracker"
    }
    
    response = client.post("/api/v1/notifications", json=payload)
    assert response.status_code == 201
    assert response.json()["success"] is True
    assert response.json()["data"]["title"] == "Welcome"

def test_get_unread_count_api(mock_service):
    mock_service.get_counts.return_value = {"unread_count": 3, "total_count": 10}
    response = client.get("/api/v1/notifications/unread-count")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["unread_count"] == 3
    assert response.json()["data"]["total_count"] == 10

def test_mark_all_read_api(mock_service):
    mock_service.mark_all_as_read.return_value = True
    response = client.post("/api/v1/notifications/mark-all-read")
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_seed_demo_notifications_api(mock_service):
    mock_service.seed_sample_notifications.return_value = []
    response = client.post("/api/v1/notifications/seed-demo")
    assert response.status_code == 200
    assert response.json()["success"] is True

