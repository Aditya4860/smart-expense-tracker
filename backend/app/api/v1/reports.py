"""
reports.py — Financial Reporting API Router.

All endpoints are JWT-protected. Users can only access their own data.
Reports are computed on-demand via ReportService.

Endpoints:
  GET /reports/monthly       — Monthly Financial Report
  GET /reports/yearly        — Yearly Financial Report
  GET /reports/expenses      — Expense Report
  GET /reports/income        — Income Report
  GET /reports/budget        — Budget Report
  GET /reports/savings-goals — Savings Goal Report
  GET /reports/cash-flow     — Cash Flow Report
"""
from calendar import monthrange
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db_session
from app.models.user import User
from app.schemas.report_schema import (
    BudgetReportResponse,
    CashFlowReportResponse,
    ExpenseReportResponse,
    IncomeReportResponse,
    MonthlyReportResponse,
    SavingsGoalReportResponse,
    YearlyReportResponse,
)
from app.services.report_service import ReportService

router = APIRouter(tags=["Reports"])


def _get_report_service(db: AsyncSession = Depends(get_db_session)) -> ReportService:
    return ReportService(db)


def _current_year_month() -> tuple[int, int]:
    today = date.today()
    return today.year, today.month


# ---------------------------------------------------------------------------
# Report 1: Monthly Financial Report
# ---------------------------------------------------------------------------

@router.get(
    "/monthly",
    response_model=MonthlyReportResponse,
    summary="Monthly Financial Report",
    description=(
        "Returns a full financial summary for the specified month: "
        "total income, total expenses, net balance, savings rate, "
        "budget utilization, and category breakdowns."
    ),
)
async def monthly_report(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (defaults to current month)"),
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(_get_report_service),
) -> MonthlyReportResponse:
    cur_year, cur_month = _current_year_month()
    return await service.monthly_report(
        user_id=current_user.id,
        year=year or cur_year,
        month=month or cur_month,
        currency=current_user.currency_preference or "INR",
    )


# ---------------------------------------------------------------------------
# Report 2: Yearly Financial Report
# ---------------------------------------------------------------------------

@router.get(
    "/yearly",
    response_model=YearlyReportResponse,
    summary="Yearly Financial Report",
    description=(
        "Returns a month-by-month financial breakdown for the specified year, "
        "including yearly totals for income, expenses, savings, and net balance."
    ),
)
async def yearly_report(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(_get_report_service),
) -> YearlyReportResponse:
    cur_year, _ = _current_year_month()
    return await service.yearly_report(
        user_id=current_user.id,
        year=year or cur_year,
        currency=current_user.currency_preference or "INR",
    )


# ---------------------------------------------------------------------------
# Report 3: Expense Report
# ---------------------------------------------------------------------------

@router.get(
    "/expenses",
    response_model=ExpenseReportResponse,
    summary="Expense Report",
    description=(
        "Detailed expense analysis for a date range: total, category breakdown, "
        "payment method breakdown, daily trend, and top 10 largest expenses."
    ),
)
async def expense_report(
    start_date: Optional[date] = Query(None, description="Start date (defaults to first day of current month)"),
    end_date: Optional[date] = Query(None, description="End date (defaults to last day of current month)"),
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(_get_report_service),
) -> ExpenseReportResponse:
    cur_year, cur_month = _current_year_month()
    last_day = monthrange(cur_year, cur_month)[1]
    start = start_date or date(cur_year, cur_month, 1)
    end = end_date or date(cur_year, cur_month, last_day)
    return await service.expense_report(
        user_id=current_user.id,
        start=start,
        end=end,
        currency=current_user.currency_preference or "INR",
    )


# ---------------------------------------------------------------------------
# Report 4: Income Report
# ---------------------------------------------------------------------------

@router.get(
    "/income",
    response_model=IncomeReportResponse,
    summary="Income Report",
    description=(
        "Comprehensive income analysis for a date range: total, category/source breakdown, "
        "monthly trend, and top 10 income entries."
    ),
)
async def income_report(
    start_date: Optional[date] = Query(None, description="Start date (defaults to first day of current month)"),
    end_date: Optional[date] = Query(None, description="End date (defaults to last day of current month)"),
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(_get_report_service),
) -> IncomeReportResponse:
    cur_year, cur_month = _current_year_month()
    last_day = monthrange(cur_year, cur_month)[1]
    start = start_date or date(cur_year, cur_month, 1)
    end = end_date or date(cur_year, cur_month, last_day)
    return await service.income_report(
        user_id=current_user.id,
        start=start,
        end=end,
        currency=current_user.currency_preference or "INR",
    )


# ---------------------------------------------------------------------------
# Report 5: Budget Report
# ---------------------------------------------------------------------------

@router.get(
    "/budget",
    response_model=BudgetReportResponse,
    summary="Budget Report",
    description=(
        "Budget utilization for the specified month: total budgeted vs. used, "
        "per-category breakdown, and list of over-budget categories."
    ),
)
async def budget_report(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (defaults to current month)"),
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(_get_report_service),
) -> BudgetReportResponse:
    cur_year, cur_month = _current_year_month()
    return await service.budget_report(
        user_id=current_user.id,
        year=year or cur_year,
        month=month or cur_month,
        currency=current_user.currency_preference or "INR",
    )


# ---------------------------------------------------------------------------
# Report 6: Savings Goal Report
# ---------------------------------------------------------------------------

@router.get(
    "/savings-goals",
    response_model=SavingsGoalReportResponse,
    summary="Savings Goal Report",
    description=(
        "Progress report for all savings goals: target, current amount, remaining, "
        "progress percentage, and full contribution history per goal."
    ),
)
async def savings_goal_report(
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(_get_report_service),
) -> SavingsGoalReportResponse:
    return await service.savings_goal_report(
        user_id=current_user.id,
        currency=current_user.currency_preference or "INR",
    )


# ---------------------------------------------------------------------------
# Report 7: Cash Flow Report
# ---------------------------------------------------------------------------

@router.get(
    "/cash-flow",
    response_model=CashFlowReportResponse,
    summary="Cash Flow Report",
    description=(
        "Month-by-month cash flow statement for a date range: income, expenses, "
        "savings contributions, and net cash flow per month and in aggregate."
    ),
)
async def cash_flow_report(
    start_date: Optional[date] = Query(None, description="Start date (defaults to first day of current month)"),
    end_date: Optional[date] = Query(None, description="End date (defaults to last day of current month)"),
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(_get_report_service),
) -> CashFlowReportResponse:
    cur_year, cur_month = _current_year_month()
    last_day = monthrange(cur_year, cur_month)[1]
    start = start_date or date(cur_year, cur_month, 1)
    end = end_date or date(cur_year, cur_month, last_day)
    return await service.cash_flow_report(
        user_id=current_user.id,
        start=start,
        end=end,
        currency=current_user.currency_preference or "INR",
    )
