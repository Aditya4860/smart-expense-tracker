"""
reports.py — Financial Reporting and Export API Router.

All endpoints are JWT-protected. Users can only access their own data.
Reports are computed on-demand via ReportService, ExportService, and PdfService.

Report Endpoints:
  GET /reports/monthly       — Monthly Financial Report
  GET /reports/yearly        — Yearly Financial Report
  GET /reports/expenses      — Expense Report
  GET /reports/income        — Income Report
  GET /reports/budget        — Budget Report
  GET /reports/savings-goals — Savings Goal Report
  GET /reports/cash-flow     — Cash Flow Report

Export Endpoints (CSV, Excel, PDF):
  GET /reports/expenses/export/csv
  GET /reports/expenses/export/excel
  GET /reports/expenses/export/pdf
  GET /reports/income/export/csv
  GET /reports/income/export/excel
  GET /reports/income/export/pdf
  GET /reports/transactions/export/csv
  GET /reports/transactions/export/excel
  GET /reports/budget/export/csv
  GET /reports/budget/export/excel
  GET /reports/budget/export/pdf
  GET /reports/savings-goals/export/csv
  GET /reports/savings-goals/export/excel
  GET /reports/savings-goals/export/pdf
  GET /reports/monthly/export/csv
  GET /reports/monthly/export/excel
  GET /reports/monthly/export/pdf
  GET /reports/yearly/export/csv
  GET /reports/yearly/export/excel
  GET /reports/yearly/export/pdf
  GET /reports/cash-flow/export/pdf
"""
from calendar import monthrange
from datetime import date
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, Query, Response
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
from app.services.export_service import ExportService
from app.services.pdf_service import PdfService
from app.services.report_service import ReportService

router = APIRouter(tags=["Reports"])

CSV_MEDIA_TYPE = "text/csv; charset=utf-8"
EXCEL_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
PDF_MEDIA_TYPE = "application/pdf"


def _get_report_service(db: AsyncSession = Depends(get_db_session)) -> ReportService:
    return ReportService(db)


def _get_export_service(db: AsyncSession = Depends(get_db_session)) -> ExportService:
    return ExportService(db)


def _get_pdf_service(db: AsyncSession = Depends(get_db_session)) -> PdfService:
    return PdfService(db)


def _current_year_month() -> tuple[int, int]:
    today = date.today()
    return today.year, today.month


# ═══════════════════════════════════════════════════════════════════════════
# REPORT ENDPOINTS (JSON Responses)
# ═══════════════════════════════════════════════════════════════════════════

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


# ═══════════════════════════════════════════════════════════════════════════
# EXPORT ENDPOINTS (CSV, Excel & PDF)
# ═══════════════════════════════════════════════════════════════════════════

# ── 1. Expenses Export ─────────────────────────────────────────────────────

@router.get(
    "/expenses/export/csv",
    summary="Export Expenses to CSV",
    description="Export filtered expense records to downloadable CSV format.",
    response_class=Response,
)
async def export_expenses_csv(
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category ID"),
    min_amount: Optional[float] = Query(None, ge=0, description="Filter by minimum amount"),
    max_amount: Optional[float] = Query(None, ge=0, description="Filter by maximum amount"),
    search: Optional[str] = Query(None, description="Search merchant/description"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_expenses_csv(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
        min_amount=min_amount,
        max_amount=max_amount,
        search_query=search,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content.encode("utf-8-sig"),
        media_type=CSV_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/expenses/export/excel",
    summary="Export Expenses to Excel",
    description="Export filtered expense records to styled Excel (.xlsx) spreadsheet.",
    response_class=Response,
)
async def export_expenses_excel(
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category ID"),
    min_amount: Optional[float] = Query(None, ge=0, description="Filter by minimum amount"),
    max_amount: Optional[float] = Query(None, ge=0, description="Filter by maximum amount"),
    search: Optional[str] = Query(None, description="Search merchant/description"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_expenses_excel(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
        min_amount=min_amount,
        max_amount=max_amount,
        search_query=search,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/expenses/export/pdf",
    summary="Export Expense Report to PDF",
    description="Export detailed expense analysis report with KPIs and tables to downloadable PDF format.",
    response_class=Response,
)
async def export_expenses_pdf(
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: User = Depends(get_current_user),
    service: PdfService = Depends(_get_pdf_service),
) -> Response:
    pdf_bytes, filename = await service.expense_report_pdf(
        user=current_user,
        start_date=start_date,
        end_date=end_date,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=pdf_bytes,
        media_type=PDF_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── 2. Income Export ───────────────────────────────────────────────────────

@router.get(
    "/income/export/csv",
    summary="Export Income to CSV",
    description="Export filtered income records to downloadable CSV format.",
    response_class=Response,
)
async def export_income_csv(
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search source/description"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_income_csv(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
        search_query=search,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content.encode("utf-8-sig"),
        media_type=CSV_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/income/export/excel",
    summary="Export Income to Excel",
    description="Export filtered income records to styled Excel (.xlsx) spreadsheet.",
    response_class=Response,
)
async def export_income_excel(
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search source/description"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_income_excel(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
        search_query=search,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/income/export/pdf",
    summary="Export Income Report to PDF",
    description="Export comprehensive income analysis report with KPIs and tables to downloadable PDF format.",
    response_class=Response,
)
async def export_income_pdf(
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: User = Depends(get_current_user),
    service: PdfService = Depends(_get_pdf_service),
) -> Response:
    pdf_bytes, filename = await service.income_report_pdf(
        user=current_user,
        start_date=start_date,
        end_date=end_date,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=pdf_bytes,
        media_type=PDF_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── 3. Transactions Export (Combined) ──────────────────────────────────────

@router.get(
    "/transactions/export/csv",
    summary="Export Unified Transactions to CSV",
    description="Export all financial transactions (both expenses and income) in chronological order to CSV.",
    response_class=Response,
)
async def export_transactions_csv(
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_transactions_csv(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content.encode("utf-8-sig"),
        media_type=CSV_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/transactions/export/excel",
    summary="Export Unified Transactions to Excel",
    description="Export all financial transactions (both expenses and income) in chronological order to styled Excel (.xlsx).",
    response_class=Response,
)
async def export_transactions_excel(
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_transactions_excel(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── 4. Budget Export ───────────────────────────────────────────────────────

@router.get(
    "/budget/export/csv",
    summary="Export Budgets to CSV",
    description="Export monthly budget utilizations and variance to downloadable CSV format.",
    response_class=Response,
)
async def export_budgets_csv(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (defaults to current month)"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_budgets_csv(
        user_id=current_user.id,
        year=year,
        month=month,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content.encode("utf-8-sig"),
        media_type=CSV_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/budget/export/excel",
    summary="Export Budgets to Excel",
    description="Export monthly budget utilizations and variance to styled Excel (.xlsx) spreadsheet.",
    response_class=Response,
)
async def export_budgets_excel(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (defaults to current month)"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_budgets_excel(
        user_id=current_user.id,
        year=year,
        month=month,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/budget/export/pdf",
    summary="Export Budget Report to PDF",
    description="Export monthly budget utilization statement with KPIs and progress table to downloadable PDF format.",
    response_class=Response,
)
async def export_budget_pdf(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (defaults to current month)"),
    current_user: User = Depends(get_current_user),
    service: PdfService = Depends(_get_pdf_service),
) -> Response:
    pdf_bytes, filename = await service.budget_report_pdf(
        user=current_user,
        year=year,
        month=month,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=pdf_bytes,
        media_type=PDF_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── 5. Savings Goals Export ────────────────────────────────────────────────

@router.get(
    "/savings-goals/export/csv",
    summary="Export Savings Goals to CSV",
    description="Export all savings goals and progress to downloadable CSV format.",
    response_class=Response,
)
async def export_savings_goals_csv(
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_savings_goals_csv(
        user_id=current_user.id,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content.encode("utf-8-sig"),
        media_type=CSV_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/savings-goals/export/excel",
    summary="Export Savings Goals to Excel",
    description="Export savings goals and contribution history to multi-sheet styled Excel (.xlsx).",
    response_class=Response,
)
async def export_savings_goals_excel(
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_savings_goals_excel(
        user_id=current_user.id,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/savings-goals/export/pdf",
    summary="Export Savings Goals Report to PDF",
    description="Export savings goals progress report with KPIs and tables to downloadable PDF format.",
    response_class=Response,
)
async def export_savings_goals_pdf(
    current_user: User = Depends(get_current_user),
    service: PdfService = Depends(_get_pdf_service),
) -> Response:
    pdf_bytes, filename = await service.savings_goal_report_pdf(
        user=current_user,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=pdf_bytes,
        media_type=PDF_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── 6. Monthly Financial Report Export ─────────────────────────────────────

@router.get(
    "/monthly/export/csv",
    summary="Export Monthly Report to CSV",
    description="Export comprehensive monthly financial statement to downloadable CSV format.",
    response_class=Response,
)
async def export_monthly_report_csv(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (defaults to current month)"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_monthly_report_csv(
        user_id=current_user.id,
        year=year,
        month=month,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content.encode("utf-8-sig"),
        media_type=CSV_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/monthly/export/excel",
    summary="Export Monthly Report to Excel",
    description="Export comprehensive monthly financial statement with KPIs and breakdowns to styled Excel (.xlsx).",
    response_class=Response,
)
async def export_monthly_report_excel(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (defaults to current month)"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_monthly_report_excel(
        user_id=current_user.id,
        year=year,
        month=month,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/monthly/export/pdf",
    summary="Export Monthly Report to PDF",
    description="Export comprehensive monthly financial statement with executive KPIs, category breakdowns, and budget utilization to downloadable PDF format.",
    response_class=Response,
)
async def export_monthly_report_pdf(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month (defaults to current month)"),
    current_user: User = Depends(get_current_user),
    service: PdfService = Depends(_get_pdf_service),
) -> Response:
    pdf_bytes, filename = await service.monthly_report_pdf(
        user=current_user,
        year=year,
        month=month,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=pdf_bytes,
        media_type=PDF_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── 7. Yearly Financial Report Export ──────────────────────────────────────

@router.get(
    "/yearly/export/csv",
    summary="Export Yearly Report to CSV",
    description="Export 12-month financial trend and yearly summary to downloadable CSV format.",
    response_class=Response,
)
async def export_yearly_report_csv(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_yearly_report_csv(
        user_id=current_user.id,
        year=year,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content.encode("utf-8-sig"),
        media_type=CSV_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/yearly/export/excel",
    summary="Export Yearly Report to Excel",
    description="Export 12-month financial statement with monthly averages to styled Excel (.xlsx).",
    response_class=Response,
)
async def export_yearly_report_excel(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    current_user: User = Depends(get_current_user),
    service: ExportService = Depends(_get_export_service),
) -> Response:
    content, filename = await service.export_yearly_report_excel(
        user_id=current_user.id,
        year=year,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=content,
        media_type=EXCEL_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/yearly/export/pdf",
    summary="Export Yearly Report to PDF",
    description="Export annual 12-month financial statement with executive KPIs and monthly averages to downloadable PDF format.",
    response_class=Response,
)
async def export_yearly_report_pdf(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Year (defaults to current year)"),
    current_user: User = Depends(get_current_user),
    service: PdfService = Depends(_get_pdf_service),
) -> Response:
    pdf_bytes, filename = await service.yearly_report_pdf(
        user=current_user,
        year=year,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=pdf_bytes,
        media_type=PDF_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── 8. Cash Flow Report Export ─────────────────────────────────────────────

@router.get(
    "/cash-flow/export/pdf",
    summary="Export Cash Flow Statement to PDF",
    description="Export month-by-month cash flow statement with inflows, outflows, and net cash positions to downloadable PDF format.",
    response_class=Response,
)
async def export_cash_flow_pdf(
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    current_user: User = Depends(get_current_user),
    service: PdfService = Depends(_get_pdf_service),
) -> Response:
    pdf_bytes, filename = await service.cash_flow_report_pdf(
        user=current_user,
        start_date=start_date,
        end_date=end_date,
        currency=current_user.currency_preference or "INR",
    )
    return Response(
        content=pdf_bytes,
        media_type=PDF_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
