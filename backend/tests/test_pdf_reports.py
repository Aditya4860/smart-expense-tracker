import pytest
from unittest.mock import AsyncMock
from uuid import uuid4
from fastapi.testclient import TestClient

from main import app
from app.api.v1.reports import _get_pdf_service
from app.core.dependencies import get_current_user
from app.models.user import User

client = TestClient(app)

def mock_get_current_user():
    user = User(email="test@example.com", is_active=True)
    user.id = uuid4()
    user.currency_preference = "INR"
    return user

@pytest.fixture
def mock_pdf_svc():
    service = AsyncMock()
    app.dependency_overrides[_get_pdf_service] = lambda: service
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield service
    app.dependency_overrides.clear()


def test_export_monthly_pdf(mock_pdf_svc):
    mock_pdf_svc.monthly_report_pdf.return_value = (b"%PDF-1.4 mock pdf data", "monthly_report_2026_08.pdf")
    response = client.get("/api/v1/reports/monthly/export/pdf?year=2026&month=8")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert 'attachment; filename="monthly_report_2026_08.pdf"' in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF")


def test_export_yearly_pdf(mock_pdf_svc):
    mock_pdf_svc.yearly_report_pdf.return_value = (b"%PDF-1.4 mock pdf data", "yearly_report_2026.pdf")
    response = client.get("/api/v1/reports/yearly/export/pdf?year=2026")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert 'attachment; filename="yearly_report_2026.pdf"' in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF")


def test_export_expenses_pdf(mock_pdf_svc):
    mock_pdf_svc.expense_report_pdf.return_value = (b"%PDF-1.4 mock pdf data", "expense_report_2026-08-01_to_2026-08-31.pdf")
    response = client.get("/api/v1/reports/expenses/export/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert 'attachment; filename="expense_report_2026-08-01_to_2026-08-31.pdf"' in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF")


def test_export_income_pdf(mock_pdf_svc):
    mock_pdf_svc.income_report_pdf.return_value = (b"%PDF-1.4 mock pdf data", "income_report_2026-08-01_to_2026-08-31.pdf")
    response = client.get("/api/v1/reports/income/export/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert 'attachment; filename="income_report_2026-08-01_to_2026-08-31.pdf"' in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF")


def test_export_budget_pdf(mock_pdf_svc):
    mock_pdf_svc.budget_report_pdf.return_value = (b"%PDF-1.4 mock pdf data", "budget_report_2026_08.pdf")
    response = client.get("/api/v1/reports/budget/export/pdf?year=2026&month=8")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert 'attachment; filename="budget_report_2026_08.pdf"' in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF")


def test_export_savings_goals_pdf(mock_pdf_svc):
    mock_pdf_svc.savings_goal_report_pdf.return_value = (b"%PDF-1.4 mock pdf data", "savings_goals_report_2026-08-09.pdf")
    response = client.get("/api/v1/reports/savings-goals/export/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert 'attachment; filename="savings_goals_report_2026-08-09.pdf"' in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF")


def test_export_cash_flow_pdf(mock_pdf_svc):
    mock_pdf_svc.cash_flow_report_pdf.return_value = (b"%PDF-1.4 mock pdf data", "cash_flow_report_2026-08-01_to_2026-08-31.pdf")
    response = client.get("/api/v1/reports/cash-flow/export/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert 'attachment; filename="cash_flow_report_2026-08-01_to_2026-08-31.pdf"' in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF")
