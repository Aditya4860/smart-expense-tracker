import pytest
from unittest.mock import AsyncMock
from uuid import uuid4
from fastapi.testclient import TestClient

from main import app
from app.api.v1.reports import _get_export_service, _get_report_service
from app.core.dependencies import get_current_user
from app.models.user import User

client = TestClient(app)

def mock_get_current_user():
    user = User(email="test@example.com", is_active=True)
    user.id = uuid4()
    user.currency_preference = "INR"
    return user

@pytest.fixture
def mock_export_svc():
    service = AsyncMock()
    app.dependency_overrides[_get_export_service] = lambda: service
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield service
    app.dependency_overrides.clear()


def test_export_expenses_csv(mock_export_svc):
    mock_export_svc.export_expenses_csv.return_value = ("Date,Merchant,Category,Amount\n2026-08-01,Store,Food,100.00", "expenses_test.csv")
    response = client.get("/api/v1/reports/expenses/export/csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert 'attachment; filename="expenses_test.csv"' in response.headers["content-disposition"]
    assert b"Store" in response.content


def test_export_expenses_excel(mock_export_svc):
    mock_export_svc.export_expenses_excel.return_value = (b"PK\x03\x04mock_excel_bytes", "expenses_test.xlsx")
    response = client.get("/api/v1/reports/expenses/export/excel")
    assert response.status_code == 200
    assert "spreadsheetml" in response.headers["content-type"]
    assert 'attachment; filename="expenses_test.xlsx"' in response.headers["content-disposition"]


def test_export_income_csv(mock_export_svc):
    mock_export_svc.export_income_csv.return_value = ("Date,Source,Category,Amount\n2026-08-01,Salary,Income,5000.00", "income_test.csv")
    response = client.get("/api/v1/reports/income/export/csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert 'attachment; filename="income_test.csv"' in response.headers["content-disposition"]


def test_export_income_excel(mock_export_svc):
    mock_export_svc.export_income_excel.return_value = (b"PK\x03\x04mock_excel_bytes", "income_test.xlsx")
    response = client.get("/api/v1/reports/income/export/excel")
    assert response.status_code == 200
    assert "spreadsheetml" in response.headers["content-type"]
    assert 'attachment; filename="income_test.xlsx"' in response.headers["content-disposition"]


def test_export_transactions_csv(mock_export_svc):
    mock_export_svc.export_transactions_csv.return_value = ("Date,Type,Merchant,Amount\n2026-08-01,EXPENSE,Store,100.00", "transactions_test.csv")
    response = client.get("/api/v1/reports/transactions/export/csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert 'attachment; filename="transactions_test.csv"' in response.headers["content-disposition"]


def test_export_transactions_excel(mock_export_svc):
    mock_export_svc.export_transactions_excel.return_value = (b"PK\x03\x04mock_excel_bytes", "transactions_test.xlsx")
    response = client.get("/api/v1/reports/transactions/export/excel")
    assert response.status_code == 200
    assert "spreadsheetml" in response.headers["content-type"]
    assert 'attachment; filename="transactions_test.xlsx"' in response.headers["content-disposition"]


def test_export_budget_csv(mock_export_svc):
    mock_export_svc.export_budgets_csv.return_value = ("Category,Budget,Utilized\nFood,500.00,200.00", "budget_test.csv")
    response = client.get("/api/v1/reports/budget/export/csv?year=2026&month=8")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert 'attachment; filename="budget_test.csv"' in response.headers["content-disposition"]


def test_export_budget_excel(mock_export_svc):
    mock_export_svc.export_budgets_excel.return_value = (b"PK\x03\x04mock_excel_bytes", "budget_test.xlsx")
    response = client.get("/api/v1/reports/budget/export/excel?year=2026&month=8")
    assert response.status_code == 200
    assert "spreadsheetml" in response.headers["content-type"]
    assert 'attachment; filename="budget_test.xlsx"' in response.headers["content-disposition"]


def test_export_savings_goals_csv(mock_export_svc):
    mock_export_svc.export_savings_goals_csv.return_value = ("Goal,Target,Saved\nEmergency,10000.00,5000.00", "goals_test.csv")
    response = client.get("/api/v1/reports/savings-goals/export/csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert 'attachment; filename="goals_test.csv"' in response.headers["content-disposition"]


def test_export_savings_goals_excel(mock_export_svc):
    mock_export_svc.export_savings_goals_excel.return_value = (b"PK\x03\x04mock_excel_bytes", "goals_test.xlsx")
    response = client.get("/api/v1/reports/savings-goals/export/excel")
    assert response.status_code == 200
    assert "spreadsheetml" in response.headers["content-type"]
    assert 'attachment; filename="goals_test.xlsx"' in response.headers["content-disposition"]


def test_export_monthly_csv(mock_export_svc):
    mock_export_svc.export_monthly_report_csv.return_value = ("Metric,Value\nTotal Income,5000.00", "monthly_test.csv")
    response = client.get("/api/v1/reports/monthly/export/csv?year=2026&month=8")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert 'attachment; filename="monthly_test.csv"' in response.headers["content-disposition"]


def test_export_monthly_excel(mock_export_svc):
    mock_export_svc.export_monthly_report_excel.return_value = (b"PK\x03\x04mock_excel_bytes", "monthly_test.xlsx")
    response = client.get("/api/v1/reports/monthly/export/excel?year=2026&month=8")
    assert response.status_code == 200
    assert "spreadsheetml" in response.headers["content-type"]
    assert 'attachment; filename="monthly_test.xlsx"' in response.headers["content-disposition"]


def test_export_yearly_csv(mock_export_svc):
    mock_export_svc.export_yearly_report_csv.return_value = ("Month,Income,Expenses\nJanuary,5000.00,2000.00", "yearly_test.csv")
    response = client.get("/api/v1/reports/yearly/export/csv?year=2026")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert 'attachment; filename="yearly_test.csv"' in response.headers["content-disposition"]


def test_export_yearly_excel(mock_export_svc):
    mock_export_svc.export_yearly_report_excel.return_value = (b"PK\x03\x04mock_excel_bytes", "yearly_test.xlsx")
    response = client.get("/api/v1/reports/yearly/export/excel?year=2026")
    assert response.status_code == 200
    assert "spreadsheetml" in response.headers["content-type"]
    assert 'attachment; filename="yearly_test.xlsx"' in response.headers["content-disposition"]
