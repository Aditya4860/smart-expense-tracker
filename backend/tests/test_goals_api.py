import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock
from uuid import uuid4
from main import app
from app.api.v1.goals import get_goal_service, get_goal_contribution_service
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
    contrib_service = AsyncMock()
    app.dependency_overrides[get_goal_service] = lambda: service
    app.dependency_overrides[get_goal_contribution_service] = lambda: contrib_service
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield service
    app.dependency_overrides.clear()

def test_list_goals_api(mock_service):
    mock_service.list_goals.return_value = []
    response = client.get("/api/v1/goals")
    assert response.status_code == 200
    assert response.json() == []

def test_create_goal_api(mock_service):
    mock_goal = {
        "id": str(uuid4()),
        "user_id": str(uuid4()),
        "name": "Vacation",
        "target_amount": 1000.0,
        "current_amount": 0.0,
        "deadline": None,
        "status": "ACTIVE",
        "created_at": "2024-01-01T12:00:00",
        "updated_at": "2024-01-01T12:00:00"
    }
    
    mock_service.create_goal.return_value = mock_goal
    
    payload = {
        "name": "Vacation",
        "target_amount": 1000.0
    }
    
    response = client.post("/api/v1/goals", json=payload)
    assert response.status_code == 201
    assert response.json()["name"] == "Vacation"
