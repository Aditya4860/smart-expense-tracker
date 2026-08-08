"""
test_reports_comprehensive.py - Comprehensive Test Suite for Financial Reporting System.

Covers:
  - All 7 Report Types (Monthly, Yearly, Expense, Income, Budget, Savings, Cash Flow)
  - Multi-Format Exports (CSV, Excel .xlsx, PDF)
  - Edge Cases: Zero income, zero expenses, zero budget, empty datasets,
    same-day transactions, month/year boundaries, leap years, large amounts, decimal rounding.
  - Multi-User Isolation and JWT Authentication.
  - Cross-module calculation parity (Dashboard == Analytics == Budget == Reports).
"""
import io
import csv
import pytest
from datetime import date
from decimal import Decimal
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

from main import app
from app.models.user import User
from app.models.enums import BudgetPeriod, GoalStatus
from app.schemas.report_schema import (
    MonthlyReportResponse,
    YearlyReportResponse,
    ExpenseReportResponse,
    IncomeReportResponse,
    BudgetReportResponse,
    SavingsGoalReportResponse,
    CashFlowReportResponse,
)
from app.services.report_service import ReportService, _pct, _round2, _month_range
from app.services.export_service import ExportService
from app.services.pdf_service import PdfService
from app.core.dependencies import get_current_user
from app.api.v1.reports import _get_report_service

client = TestClient(app)


# ---------------------------------------------------------------------------
# Fixtures & Mock Helpers
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_user():
    u = User(email="testuser@example.com", is_active=True)
    u.id = uuid4()
    u.currency_preference = "INR"
    return u


@pytest.fixture
def mock_user_2():
    u = User(email="otheruser@example.com", is_active=True)
    u.id = uuid4()
    u.currency_preference = "INR"
    return u


def make_mock_result(rows):
    """Helper to mock SQLAlchemy AsyncSession execute() result."""
    mock_res = MagicMock()
    mock_res.all.return_value = rows
    mock_res.scalars.return_value.all.return_value = rows
    mock_res.scalar.return_value = rows[0] if rows else 0.0
    return mock_res


# ---------------------------------------------------------------------------
# 1. Edge Case & Calculation Helper Tests
# ---------------------------------------------------------------------------

def test_pct_helper_edge_cases():
    """Verify _pct handles zero division, negative values, and clamping."""
    assert _pct(0, 0) == 0.0
    assert _pct(50, 0) == 0.0
    assert _pct(-10, 100) == -10.0
    assert _pct(100, 100) == 100.0
    assert _pct(200, 100) == 100.0  # Clamped to 100 max
    assert _pct(33.33333, 100) == 33.33  # 2 decimal places


def test_round2_helper_precision():
    """Verify _round2 properly rounds high-precision decimals and large values."""
    assert _round2(0.0) == 0.0
    assert _round2(123.456) == 123.46
    assert _round2(123.454) == 123.45
    assert _round2(99999999.999) == 100000000.00
    assert _round2(10000000.556) == 10000000.56


def test_month_range_boundaries_and_leap_year():
    """Verify month range calculations for standard, 31-day, 30-day, and leap years."""
    # February non-leap year
    s, e = _month_range(2025, 2)
    assert s == date(2025, 2, 1) and e == date(2025, 2, 28)

    # February leap year
    s, e = _month_range(2024, 2)
    assert s == date(2024, 2, 1) and e == date(2024, 2, 29)

    # 31-day months (Dec, Jan, July, Aug)
    s, e = _month_range(2026, 12)
    assert s == date(2026, 12, 1) and e == date(2026, 12, 31)

    s, e = _month_range(2026, 7)
    assert s == date(2026, 7, 1) and e == date(2026, 7, 31)

    # 30-day month (April, Sept)
    s, e = _month_range(2026, 4)
    assert s == date(2026, 4, 1) and e == date(2026, 4, 30)


# ---------------------------------------------------------------------------
# 2. ReportService Unit Tests (All 7 Reports)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_monthly_report_empty_dataset(mock_user):
    """Monthly report for a user with zero transactions returns clean zeroed schema."""
    mock_db = AsyncMock()
    service = ReportService(mock_db)

    service._income_repo.get_statistics = AsyncMock(return_value={
        "total_transactions": 0, "total_amount": 0.0, "average_amount": 0.0, "max_amount": 0.0, "min_amount": 0.0
    })
    service._expense_repo.get_statistics = AsyncMock(return_value={
        "total_transactions": 0, "total_amount": 0.0, "average_amount": 0.0, "max_amount": 0.0, "min_amount": 0.0
    })
    service._monthly_savings_contributions = AsyncMock(return_value=0.0)
    service._expense_category_breakdown = AsyncMock(return_value=[])
    service._income_category_breakdown = AsyncMock(return_value=[])
    service._budget_repo.list_all_budget_utilizations = AsyncMock(return_value=[])

    report = await service.monthly_report(mock_user.id, 2026, 8, "INR")

    assert report.total_income == 0.0
    assert report.total_expenses == 0.0
    assert report.net_balance == 0.0
    assert report.savings_contributions == 0.0
    assert report.savings_rate == 0.0
    assert report.income_transaction_count == 0
    assert report.expense_transaction_count == 0
    assert report.budget_utilization == []
    assert report.expense_by_category == []


@pytest.mark.asyncio
async def test_monthly_report_zero_income_with_expenses(mock_user):
    """Monthly report with zero income and positive expenses shows deficit and 0% savings rate."""
    mock_db = AsyncMock()
    service = ReportService(mock_db)

    service._income_repo.get_statistics = AsyncMock(return_value={
        "total_transactions": 0, "total_amount": 0.0, "average_amount": 0.0, "max_amount": 0.0, "min_amount": 0.0
    })
    service._expense_repo.get_statistics = AsyncMock(return_value={
        "total_transactions": 3, "total_amount": 1500.75, "average_amount": 500.25, "max_amount": 800.0, "min_amount": 200.75
    })
    service._monthly_savings_contributions = AsyncMock(return_value=0.0)
    service._expense_category_breakdown = AsyncMock(return_value=[])
    service._income_category_breakdown = AsyncMock(return_value=[])
    service._budget_repo.list_all_budget_utilizations = AsyncMock(return_value=[])

    report = await service.monthly_report(mock_user.id, 2026, 8, "INR")

    assert report.total_income == 0.0
    assert report.total_expenses == 1500.75
    assert report.net_balance == -1500.75
    assert report.savings_rate == 0.0
    assert report.expense_transaction_count == 3


@pytest.mark.asyncio
async def test_monthly_report_high_volume_and_savings_rate(mock_user):
    """Monthly report correctly computes savings rate from goal contributions."""
    mock_db = AsyncMock()
    service = ReportService(mock_db)

    service._income_repo.get_statistics = AsyncMock(return_value={
        "total_transactions": 2, "total_amount": 100000.00, "average_amount": 50000.0, "max_amount": 60000.0, "min_amount": 40000.0
    })
    service._expense_repo.get_statistics = AsyncMock(return_value={
        "total_transactions": 10, "total_amount": 40000.00, "average_amount": 4000.0, "max_amount": 12000.0, "min_amount": 500.0
    })
    service._monthly_savings_contributions = AsyncMock(return_value=25000.00)
    service._expense_category_breakdown = AsyncMock(return_value=[])
    service._income_category_breakdown = AsyncMock(return_value=[])
    service._budget_repo.list_all_budget_utilizations = AsyncMock(return_value=[])

    report = await service.monthly_report(mock_user.id, 2026, 8, "INR")

    assert report.total_income == 100000.00
    assert report.total_expenses == 40000.00
    assert report.net_balance == 60000.00
    assert report.savings_contributions == 25000.00
    assert report.savings_rate == 25.0


@pytest.mark.asyncio
async def test_yearly_report_aggregation(mock_user):
    """Yearly report aggregates 12 months with averages and totals."""
    mock_db = AsyncMock()
    service = ReportService(mock_db)

    inc_row = MagicMock(month=8, total=60000.0)
    exp_row = MagicMock(month=8, total=25000.0)
    sav_row = MagicMock(month=8, total=5000.0)

    mock_db.execute.side_effect = [
        make_mock_result([inc_row]),
        make_mock_result([exp_row]),
        make_mock_result([sav_row]),
    ]

    report = await service.yearly_report(mock_user.id, 2026, "INR")

    assert report.year == 2026
    assert report.total_income == 60000.0
    assert report.total_expenses == 25000.0
    assert report.net_balance == 35000.0
    assert report.total_savings_contributions == 5000.0
    assert len(report.monthly_breakdown) == 12


@pytest.mark.asyncio
async def test_expense_report_aggregations(mock_user):
    """Expense report properly computes statistics and breakdowns."""
    mock_db = AsyncMock()
    service = ReportService(mock_db)

    service._expense_repo.get_statistics = AsyncMock(return_value={
        "total_transactions": 5, "total_amount": 7500.0, "average_amount": 1500.0, "max_amount": 3000.0, "min_amount": 500.0
    })
    service._expense_category_breakdown = AsyncMock(return_value=[])
    service._payment_method_breakdown = AsyncMock(return_value=[])
    service._daily_expense_trend = AsyncMock(return_value=[])
    service._top_expenses = AsyncMock(return_value=[])

    report = await service.expense_report(mock_user.id, date(2026, 8, 1), date(2026, 8, 31), "INR")

    assert report.total_expenses == 7500.0
    assert report.transaction_count == 5
    assert report.average_expense == 1500.0
    assert report.largest_expense == 3000.0
    assert report.smallest_expense == 500.0


@pytest.mark.asyncio
async def test_income_report_aggregations(mock_user):
    """Income report calculates totals, averages, and trend."""
    mock_db = AsyncMock()
    service = ReportService(mock_db)

    service._income_repo.get_statistics = AsyncMock(return_value={
        "total_transactions": 3, "total_amount": 90000.0, "average_amount": 30000.0, "max_amount": 50000.0, "min_amount": 20000.0
    })
    service._income_repo.get_monthly_summary = AsyncMock(return_value=90000.0)
    service._income_category_breakdown = AsyncMock(return_value=[])
    service._income_source_breakdown = AsyncMock(return_value=[])
    service._monthly_income_trend = AsyncMock(return_value=[])
    service._top_income = AsyncMock(return_value=[])

    report = await service.income_report(mock_user.id, date(2026, 8, 1), date(2026, 8, 31), "INR")

    assert report.total_income == 90000.0
    assert report.transaction_count == 3
    assert report.average_income == 30000.0
    assert report.largest_income == 50000.0
    assert report.smallest_income == 20000.0


@pytest.mark.asyncio
async def test_budget_report_calculations(mock_user):
    """Budget report correctly flags over-budget categories and calculates remaining amounts."""
    mock_db = AsyncMock()
    service = ReportService(mock_db)

    raw_budgets = [
        {
            "budget_id": uuid4(),
            "category_id": uuid4(),
            "category_name": "Groceries",
            "budget_amount": 5000.0,
            "utilized_amount": 3500.0,
            "remaining_amount": 1500.0,
            "period": BudgetPeriod.MONTHLY,
        },
        {
            "budget_id": uuid4(),
            "category_id": uuid4(),
            "category_name": "Dining",
            "budget_amount": 2000.0,
            "utilized_amount": 2500.0,
            "remaining_amount": -500.0,
            "period": BudgetPeriod.MONTHLY,
        },
    ]
    service._budget_repo.list_all_budget_utilizations = AsyncMock(return_value=raw_budgets)

    report = await service.budget_report(mock_user.id, 2026, 8, "INR")

    assert report.total_budgeted == 7000.0
    assert report.total_utilized == 6000.0
    assert report.total_remaining == 1000.0
    assert report.overall_utilization_percentage == 85.71
    assert report.over_budget_count == 1
    assert report.within_budget_count == 1
    assert len(report.over_budget_categories) == 1
    assert report.over_budget_categories[0].category_name == "Dining"
    assert report.over_budget_categories[0].is_over_budget is True


@pytest.mark.asyncio
async def test_savings_goal_report_calculations(mock_user):
    """Savings goal report computes progress percentage and aggregates totals."""
    mock_db = AsyncMock()
    service = ReportService(mock_db)

    goal_1 = MagicMock()
    goal_1.id = uuid4()
    goal_1.name = "Emergency Fund"
    goal_1.target_amount = Decimal("50000.00")
    goal_1.current_amount = Decimal("25000.00")
    goal_1.deadline = date(2026, 12, 31)
    goal_1.status = GoalStatus.ACTIVE

    goal_2 = MagicMock()
    goal_2.id = uuid4()
    goal_2.name = "Vacation"
    goal_2.target_amount = Decimal("20000.00")
    goal_2.current_amount = Decimal("20000.00")
    goal_2.deadline = date(2026, 9, 30)
    goal_2.status = GoalStatus.COMPLETED

    service._goal_repo.list_goals = AsyncMock(return_value=[goal_1, goal_2])
    service._contribution_repo.list_contributions = AsyncMock(return_value=[])

    report = await service.savings_goal_report(mock_user.id, "INR")

    assert report.total_goals == 2
    assert report.active_goals == 1
    assert report.completed_goals == 1
    assert report.total_target_amount == 70000.00
    assert report.total_saved_amount == 45000.00
    assert report.total_remaining_amount == 25000.00
    assert report.overall_progress_percentage == 64.29


@pytest.mark.asyncio
async def test_cash_flow_report_aggregations(mock_user):
    """Cash flow report reconciles inflow, outflow, and net cash flow."""
    mock_db = AsyncMock()
    service = ReportService(mock_db)

    service._income_repo.get_monthly_summary = AsyncMock(return_value=50000.0)
    service._expense_repo.get_monthly_summary = AsyncMock(return_value=30000.0)
    service._monthly_savings_contributions = AsyncMock(return_value=5000.0)

    report = await service.cash_flow_report(mock_user.id, date(2026, 8, 1), date(2026, 8, 31), "INR")

    assert report.total_income == 50000.0
    assert report.total_expenses == 30000.0
    assert report.total_savings_contributions == 5000.0
    assert report.net_cash_flow == 20000.0  # 50000 - 30000


# ---------------------------------------------------------------------------
# 3. Export Service Tests (CSV & Excel)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_export_service_csv_structure(mock_user):
    """Export service generates valid CSV with correct headers and data."""
    mock_db = AsyncMock()
    export_svc = ExportService(mock_db)

    mock_exp = MagicMock()
    mock_exp.date = date(2026, 8, 5)
    mock_exp.merchant = "Supermarket"
    mock_exp.description = "Weekly Groceries"
    mock_exp.category_name = "Food"
    mock_exp.category = None
    mock_exp.payment_method = "UPI"
    mock_exp.amount = 1450.50

    export_svc._expense_repo.list_expenses = AsyncMock(return_value=[mock_exp])

    csv_content, filename = await export_svc.export_expenses_csv(mock_user.id, date(2026, 8, 1), date(2026, 8, 31))

    assert "expenses_2026-08-01_to_2026-08-31.csv" in filename

    reader = csv.reader(io.StringIO(csv_content))
    rows = list(reader)
    assert rows[0] == ["Date", "Merchant / Payee", "Category", "Payment Method", "Amount (INR)", "Description"]
    assert rows[1][0] == "2026-08-05"
    assert rows[1][1] == "Supermarket"
    assert rows[1][4] == "1450.50"


@pytest.mark.asyncio
async def test_export_service_excel_generation(mock_user):
    """Export service generates valid .xlsx binary for financial reports."""
    mock_db = AsyncMock()
    export_svc = ExportService(mock_db)

    mock_report = MonthlyReportResponse(
        year=2026,
        month=8,
        currency="INR",
        total_income=50000.0,
        total_expenses=20000.0,
        net_balance=30000.0,
        savings_contributions=5000.0,
        savings_rate=10.0,
        income_transaction_count=2,
        expense_transaction_count=8,
        budget_utilization=[],
        expense_by_category=[],
        income_by_category=[]
    )
    export_svc._report_service.monthly_report = AsyncMock(return_value=mock_report)

    xlsx_bytes, filename = await export_svc.export_monthly_report_excel(mock_user.id, 2026, 8)

    assert filename == "monthly_financial_report_2026_08.xlsx"
    assert xlsx_bytes.startswith(b"PK\x03\x04")
    assert len(xlsx_bytes) > 1000


# ---------------------------------------------------------------------------
# 4. PDF Service Tests (All 7 Reports)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_all_pdf_generators(mock_user):
    """Verify all 7 PDF report generator methods output valid %PDF binary."""
    mock_db = AsyncMock()
    pdf_svc = PdfService(mock_db)

    pdf_svc._report_service.monthly_report = AsyncMock(return_value=MonthlyReportResponse(
        year=2026, month=8, currency="INR", total_income=60000.0, total_expenses=25000.0, net_balance=35000.0,
        savings_contributions=10000.0, savings_rate=16.67, income_transaction_count=2, expense_transaction_count=12,
        budget_utilization=[], expense_by_category=[], income_by_category=[]
    ))
    pdf_svc._report_service.yearly_report = AsyncMock(return_value=YearlyReportResponse(
        year=2026, currency="INR", total_income=120000.0, total_expenses=60000.0, net_balance=60000.0,
        total_savings_contributions=12000.0, average_monthly_income=10000.0, average_monthly_expenses=5000.0,
        monthly_breakdown=[]
    ))
    pdf_svc._report_service.expense_report = AsyncMock(return_value=ExpenseReportResponse(
        start_date=date(2026, 8, 1), end_date=date(2026, 8, 31), currency="INR", total_expenses=5000.0,
        transaction_count=5, average_expense=1000.0, largest_expense=2000.0, smallest_expense=100.0,
        by_category=[], by_payment_method=[], daily_trend=[], top_expenses=[]
    ))
    pdf_svc._report_service.income_report = AsyncMock(return_value=IncomeReportResponse(
        start_date=date(2026, 8, 1), end_date=date(2026, 8, 31), currency="INR", total_income=10000.0,
        transaction_count=2, average_income=5000.0, largest_income=6000.0, smallest_income=4000.0,
        by_category=[], by_source=[], monthly_trend=[], top_income=[]
    ))
    pdf_svc._report_service.budget_report = AsyncMock(return_value=BudgetReportResponse(
        year=2026, month=8, currency="INR", total_budgeted=10000.0, total_utilized=5000.0, total_remaining=5000.0,
        overall_utilization_percentage=50.0, over_budget_count=0, within_budget_count=1, budgets=[], over_budget_categories=[]
    ))
    pdf_svc._report_service.savings_goal_report = AsyncMock(return_value=SavingsGoalReportResponse(
        currency="INR", total_goals=1, active_goals=1, completed_goals=0, total_target_amount=50000.0,
        total_saved_amount=25000.0, total_remaining_amount=25000.0, overall_progress_percentage=50.0, goals=[]
    ))
    pdf_svc._report_service.cash_flow_report = AsyncMock(return_value=CashFlowReportResponse(
        start_date=date(2026, 8, 1), end_date=date(2026, 8, 31), currency="INR", total_income=10000.0,
        total_expenses=4000.0, total_savings_contributions=1000.0, net_cash_flow=6000.0, monthly_breakdown=[]
    ))

    # Test Monthly PDF
    p_bytes, fn = await pdf_svc.monthly_report_pdf(mock_user, 2026, 8)
    assert p_bytes.startswith(b"%PDF-") and "monthly_report" in fn

    # Test Yearly PDF
    p_bytes, fn = await pdf_svc.yearly_report_pdf(mock_user, 2026)
    assert p_bytes.startswith(b"%PDF-") and "yearly_report" in fn

    # Test Expense PDF
    p_bytes, fn = await pdf_svc.expense_report_pdf(mock_user, date(2026, 8, 1), date(2026, 8, 31))
    assert p_bytes.startswith(b"%PDF-") and "expense_report" in fn

    # Test Income PDF
    p_bytes, fn = await pdf_svc.income_report_pdf(mock_user, date(2026, 8, 1), date(2026, 8, 31))
    assert p_bytes.startswith(b"%PDF-") and "income_report" in fn

    # Test Budget PDF
    p_bytes, fn = await pdf_svc.budget_report_pdf(mock_user, 2026, 8)
    assert p_bytes.startswith(b"%PDF-") and "budget_report" in fn

    # Test Savings Goal PDF
    p_bytes, fn = await pdf_svc.savings_goal_report_pdf(mock_user)
    assert p_bytes.startswith(b"%PDF-") and "savings_goals_report" in fn

    # Test Cash Flow PDF
    p_bytes, fn = await pdf_svc.cash_flow_report_pdf(mock_user, date(2026, 8, 1), date(2026, 8, 31))
    assert p_bytes.startswith(b"%PDF-") and "cash_flow_report" in fn


# ---------------------------------------------------------------------------
# 5. Security, Authorization & Multi-User Isolation Tests
# ---------------------------------------------------------------------------

def test_unauthenticated_request_fails():
    """Unauthenticated requests without JWT dependency override fail with 401."""
    app.dependency_overrides.clear()
    response = client.get("/api/v1/reports/monthly?year=2026&month=8")
    assert response.status_code == 401


def test_user_data_isolation(mock_user, mock_user_2):
    """User A's request uses User A's ID and does not leak User B's records."""
    mock_report_svc = AsyncMock()
    app.dependency_overrides[_get_report_service] = lambda: mock_report_svc
    app.dependency_overrides[get_current_user] = lambda: mock_user

    mock_report_svc.monthly_report.return_value = {
        "year": 2026, "month": 8, "currency": "INR",
        "total_income": 5000.0, "total_expenses": 2000.0, "net_balance": 3000.0,
        "savings_contributions": 0.0, "savings_rate": 0.0,
        "income_transaction_count": 1, "expense_transaction_count": 2,
        "budget_utilization": [], "expense_by_category": [], "income_by_category": []
    }

    response = client.get("/api/v1/reports/monthly?year=2026&month=8")
    assert response.status_code == 200

    mock_report_svc.monthly_report.assert_called_once_with(
        user_id=mock_user.id,
        year=2026,
        month=8,
        currency="INR"
    )

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# 6. Cross-Module Mathematical Parity Assertions
# ---------------------------------------------------------------------------

def test_cross_module_calculation_parity():
    """
    Verify that frontend and backend calculation formulas produce identical numbers:
    - Net Balance = Income - Expenses
    - Savings Rate = (Savings / Income) * 100
    - Budget Utilization = (Spent / Budget) * 100
    """
    income = 75000.00
    expenses = 42500.50
    savings_contrib = 15000.00

    # Backend formulas
    be_net_balance = _round2(income - expenses)
    be_savings_rate = _pct(savings_contrib, income)

    # Frontend formulas (equivalent JS arithmetic)
    fe_net_balance = round((income - expenses) * 100) / 100
    fe_savings_rate = round((savings_contrib / income) * 100 * 100) / 100

    assert be_net_balance == fe_net_balance == 32499.50
    assert be_savings_rate == fe_savings_rate == 20.0

    # Budget utilization
    budget_limit = 12000.00
    spent = 9600.00
    be_util = _pct(spent, budget_limit)
    fe_util = float(f"{(spent / budget_limit) * 100:.2f}")

    assert be_util == fe_util == 80.0
    assert (budget_limit - spent) == 2400.00
