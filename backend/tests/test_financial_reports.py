import pytest
from unittest.mock import AsyncMock
from uuid import uuid4
from fastapi.testclient import TestClient

from main import app
from app.api.v1.reports import _get_report_service
from app.core.dependencies import get_current_user
from app.models.user import User

client = TestClient(app)

def mock_get_current_user():
    user = User(email="test@example.com", is_active=True)
    user.id = uuid4()
    user.currency_preference = "INR"
    return user

@pytest.fixture
def mock_report_svc():
    service = AsyncMock()
    app.dependency_overrides[_get_report_service] = lambda: service
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield service
    app.dependency_overrides.clear()


def test_monthly_report_api(mock_report_svc):
    mock_report_svc.monthly_report.return_value = {
        "year": 2026, "month": 8, "currency": "INR",
        "total_income": 5000.0, "total_expenses": 2000.0, "net_balance": 3000.0,
        "savings_contributions": 500.0, "savings_rate": 10.0,
        "income_transaction_count": 2, "expense_transaction_count": 5,
        "budget_utilization": [], "expense_by_category": [], "income_by_category": []
    }
    response = client.get("/api/v1/reports/monthly?year=2026&month=8")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["total_income"] == 5000.0


def test_yearly_report_api(mock_report_svc):
    mock_report_svc.yearly_report.return_value = {
        "year": 2026, "currency": "INR",
        "total_income": 60000.0, "total_expenses": 24000.0, "net_balance": 36000.0,
        "total_savings_contributions": 6000.0,
        "average_monthly_income": 5000.0, "average_monthly_expenses": 2000.0,
        "monthly_breakdown": []
    }
    response = client.get("/api/v1/reports/yearly?year=2026")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["total_income"] == 60000.0


def test_expense_report_api(mock_report_svc):
    mock_report_svc.expense_report.return_value = {
        "start_date": "2026-08-01", "end_date": "2026-08-31", "currency": "INR",
        "total_expenses": 2000.0, "transaction_count": 5, "average_daily_expense": 64.52,
        "by_category": [], "by_payment_method": [], "daily_trend": [], "largest_expenses": []
    }
    response = client.get("/api/v1/reports/expenses")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["total_expenses"] == 2000.0


def test_income_report_api(mock_report_svc):
    mock_report_svc.income_report.return_value = {
        "start_date": "2026-08-01", "end_date": "2026-08-31", "currency": "INR",
        "total_income": 5000.0, "transaction_count": 2, "average_transaction_amount": 2500.0,
        "by_category": [], "by_source": [], "monthly_trend": [], "largest_income_entries": []
    }
    response = client.get("/api/v1/reports/income")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["total_income"] == 5000.0


def test_budget_report_api(mock_report_svc):
    mock_report_svc.budget_report.return_value = {
        "year": 2026, "month": 8, "currency": "INR",
        "total_budgeted": 3000.0, "total_utilized": 1500.0, "total_remaining": 1500.0,
        "overall_utilization_percentage": 50.0, "over_budget_count": 0,
        "budgets": [], "over_budget_categories": []
    }
    response = client.get("/api/v1/reports/budget?year=2026&month=8")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["total_budgeted"] == 3000.0


def test_savings_goal_report_api(mock_report_svc):
    mock_report_svc.savings_goal_report.return_value = {
        "currency": "INR", "total_goals": 2, "active_goals": 2, "completed_goals": 0,
        "total_target_amount": 20000.0, "total_saved_amount": 8000.0,
        "total_remaining_amount": 12000.0, "overall_progress_percentage": 40.0,
        "goals": []
    }
    response = client.get("/api/v1/reports/savings-goals")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["total_goals"] == 2


def test_cash_flow_report_api(mock_report_svc):
    mock_report_svc.cash_flow_report.return_value = {
        "start_date": "2026-08-01", "end_date": "2026-08-31", "currency": "INR",
        "total_income": 5000.0, "total_expenses": 2000.0, "total_savings_contributions": 500.0,
        "net_cash_flow": 2500.0, "monthly_breakdown": []
    }
    response = client.get("/api/v1/reports/cash-flow")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["net_cash_flow"] == 2500.0


def test_report_service_calculation_helpers():
    from app.services.report_service import _pct, _round2, _month_range
    from datetime import date

    # Precision tests
    assert _round2(123.456) == 123.46
    assert _round2(0.0001) == 0.0
    assert _round2(100) == 100.0

    # Percentage tests
    assert _pct(50, 100) == 50.0
    assert _pct(0, 100) == 0.0
    assert _pct(100, 0) == 0.0  # Zero division guard
    assert _pct(150, 100) == 100.0  # Clamped

    # Month range date boundary tests
    start, end = _month_range(2026, 2)
    assert start == date(2026, 2, 1)
    assert end == date(2026, 2, 28)

    start, end = _month_range(2024, 2)  # Leap year
    assert start == date(2024, 2, 1)
    assert end == date(2024, 2, 29)

    start, end = _month_range(2026, 7)
    assert start == date(2026, 7, 1)
    assert end == date(2026, 7, 31)

