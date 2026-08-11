import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4
from datetime import date
from fastapi.testclient import TestClient

from main import app
from app.models.user import User
from app.services.ai_service import AIService, _INSIGHTS_CACHE
from app.core.dependencies import get_current_user

client = TestClient(app)

@pytest.fixture
def mock_user():
    u = User(email="ai_test@example.com", is_active=True)
    u.id = uuid4()
    u.currency_preference = "INR"
    return u

@pytest.fixture(autouse=True)
def clear_cache():
    _INSIGHTS_CACHE.clear()

@pytest.mark.asyncio
async def test_ai_service_mock_provider(mock_user):
    mock_db = AsyncMock()
    ai_service = AIService(mock_db)
    from app.services.ai_providers.mock_provider import MockProvider
    ai_service.provider_name = "mock"
    ai_service.provider = MockProvider()

    # Mock the internal report fetches
    ai_service.report_service.monthly_report = AsyncMock()
    ai_service.report_service.monthly_report.return_value = MagicMock(
        total_income=5000.0,
        total_expenses=3000.0,
        net_balance=2000.0,
        savings_rate=15.0,
        expense_by_category=[],
        income_transaction_count=2,
        expense_transaction_count=10
    )
    ai_service.report_service.budget_report = AsyncMock()
    ai_service.report_service.budget_report.return_value = MagicMock(
        overall_utilization_percentage=50.0,
        over_budget_categories=[]
    )
    ai_service.report_service.savings_goal_report = AsyncMock()
    ai_service.report_service.savings_goal_report.return_value = MagicMock(
        overall_progress_percentage=20.0,
        active_goals=1
    )

    insights, cached, provider = await ai_service.get_insights(mock_user.id, "INR")

    assert len(insights) > 0
    assert not cached
    assert provider == "mock"
    assert any("positive net balance" in s for s in insights)

    # Second call should hit the cache
    insights2, cached2, provider2 = await ai_service.get_insights(mock_user.id, "INR")
    assert cached2 is True
    assert insights == insights2

@pytest.mark.asyncio
async def test_ai_service_empty_data(mock_user):
    mock_db = AsyncMock()
    ai_service = AIService(mock_db)

    ai_service.report_service.monthly_report = AsyncMock()
    ai_service.report_service.monthly_report.return_value = MagicMock(
        income_transaction_count=0,
        expense_transaction_count=0
    )
    ai_service.report_service.yearly_report = AsyncMock()
    ai_service.report_service.yearly_report.return_value = MagicMock(
        total_income=0,
        total_expenses=0
    )

    insights, cached, provider = await ai_service.get_insights(mock_user.id, "INR")

    assert len(insights) == 1
    assert "Insufficient financial data" in insights[0]
    assert not cached

def test_api_insights_unauthorized():
    response = client.get("/api/v1/ai/insights")
    assert response.status_code == 401

def test_api_insights_authorized(mock_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    with patch("app.services.ai_service.AIService.get_insights", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = (["Insight 1", "Insight 2"], False, "mock")
        
        response = client.get("/api/v1/ai/insights")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["insights"] == ["Insight 1", "Insight 2"]
        assert data["data"]["provider"] == "mock"
        assert data["data"]["cached"] is False
        
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_ai_service_chat_mock(mock_user):
    mock_db = AsyncMock()
    ai_service = AIService(mock_db)
    from app.services.ai_providers.mock_provider import MockProvider
    ai_service.provider_name = "mock"
    ai_service.provider = MockProvider()

    # Mock the internal report fetches
    ai_service.report_service.monthly_report = AsyncMock()
    ai_service.report_service.monthly_report.return_value = MagicMock(
        total_income=5000.0,
        total_expenses=3000.0,
        net_balance=2000.0,
        savings_rate=15.0,
        expense_by_category=[],
        income_transaction_count=2,
        expense_transaction_count=10
    )
    ai_service.report_service.budget_report = AsyncMock()
    ai_service.report_service.budget_report.return_value = MagicMock(
        overall_utilization_percentage=50.0,
        over_budget_categories=[]
    )
    ai_service.report_service.savings_goal_report = AsyncMock()
    ai_service.report_service.savings_goal_report.return_value = MagicMock(
        overall_progress_percentage=20.0,
        active_goals=1
    )

    from app.schemas.ai_schema import ChatMessage
    
    # Test spending question
    msgs_spend = [ChatMessage(role="user", content="How much did I spend this month?")]
    reply_spend = await ai_service.chat(mock_user.id, "INR", msgs_spend)
    assert "3000.0" in reply_spend

    # Test savings question
    msgs_save = [ChatMessage(role="user", content="How much am I saving?")]
    reply_save = await ai_service.chat(mock_user.id, "INR", msgs_save)
    assert "15.0%" in reply_save

def test_api_chat_authorized(mock_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    with patch("app.services.ai_service.AIService.chat", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = "You have spent ₹1,000 this month."
        
        payload = {
            "messages": [
                {"role": "user", "content": "How much did I spend?"}
            ]
        }
        
        response = client.post("/api/v1/ai/chat", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["reply"] == "You have spent ₹1,000 this month."
        
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_ai_service_recommendations_mock(mock_user):
    mock_db = AsyncMock()
    ai_service = AIService(mock_db)
    from app.services.ai_providers.mock_provider import MockProvider
    ai_service.provider_name = "mock"
    ai_service.provider = MockProvider()

    # Mock the internal report fetches
    ai_service.report_service.monthly_report = AsyncMock()
    ai_service.report_service.monthly_report.return_value = MagicMock(
        total_income=5000.0,
        total_expenses=3000.0,
        net_balance=2000.0,
        savings_rate=15.0,
        expense_by_category=[],
        currency="INR"
    )
    ai_service.report_service.budget_report = AsyncMock()
    ai_service.report_service.budget_report.return_value = MagicMock(
        overall_utilization_percentage=50.0,
        over_budget_categories=[]
    )
    ai_service.report_service.savings_goal_report = AsyncMock()
    ai_service.report_service.savings_goal_report.return_value = MagicMock(
        overall_progress_percentage=20.0,
        active_goals=1
    )

    recs, cached, provider = await ai_service.get_recommendations(mock_user.id, "INR")
    
    assert len(recs) > 0
    assert not cached
    assert provider == "mock"
    assert "Increase Monthly Savings" in [r["title"] for r in recs]

def test_api_recommendations_authorized(mock_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    with patch("app.services.ai_service.AIService.get_recommendations", new_callable=AsyncMock) as mock_rec:
        mock_rec.return_value = (
            [
                {
                    "title": "Reduce Dining Out",
                    "description": "Cook at home.",
                    "type": "SPENDING",
                    "evidence": "You spent 80% of food budget."
                }
            ],
            False,
            "mock"
        )
        
        response = client.get("/api/v1/ai/recommendations")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]["recommendations"]) == 1
        assert data["data"]["recommendations"][0]["title"] == "Reduce Dining Out"
        assert data["data"]["recommendations"][0]["type"] == "SPENDING"
        
    app.dependency_overrides.clear()

