"""
report_service.py - Centralized Financial Reporting Service.

Computes all report types from existing DB records via SQL aggregation.
Reuses ExpenseRepository, IncomeRepository, BudgetRepository, GoalRepository,
and GoalContributionRepository. No business logic duplication.
"""
from __future__ import annotations

import uuid
from calendar import monthrange
from datetime import date
from typing import List, Set, Tuple

from sqlalchemy import and_, extract, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.expense import Expense
from app.models.goal import Goal
from app.models.goal_contribution import GoalContribution
from app.models.income import Income
from app.models.category import Category
from app.repositories.budget_repository import BudgetRepository
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.goal_contribution_repository import GoalContributionRepository
from app.repositories.goal_repository import GoalRepository
from app.repositories.income_repository import IncomeRepository
from app.schemas.report_schema import (
    BudgetReportResponse,
    BudgetUtilizationItem,
    CashFlowEntry,
    CashFlowReportResponse,
    CategoryBreakdown,
    DailyTrend,
    ExpenseReportResponse,
    GoalContributionItem,
    GoalReportItem,
    IncomeReportResponse,
    MonthlyReportResponse,
    MonthlyTrend,
    PaymentMethodBreakdown,
    SavingsGoalReportResponse,
    SourceBreakdown,
    TopTransaction,
    YearlyReportResponse,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _pct(numerator: float, denominator: float) -> float:
    if denominator <= 0:
        return 0.0
    return round(min((numerator / denominator) * 100, 100.0), 2)


def _round2(value: float) -> float:
    return round(float(value), 2)


def _month_range(year: int, month: int) -> Tuple[date, date]:
    last_day = monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last_day)


def _build_budget_util_item(row: dict) -> BudgetUtilizationItem:
    budget_amount = _round2(row["budget_amount"])
    utilized_amount = _round2(row["utilized_amount"])
    remaining = _round2(budget_amount - utilized_amount)
    pct = _pct(utilized_amount, budget_amount)
    return BudgetUtilizationItem(
        budget_id=row["budget_id"],
        category_id=row["category_id"],
        category_name=row["category_name"],
        budget_amount=budget_amount,
        utilized_amount=utilized_amount,
        remaining_amount=remaining,
        utilization_percentage=pct,
        is_over_budget=utilized_amount > budget_amount,
    )


# ---------------------------------------------------------------------------
# ReportService
# ---------------------------------------------------------------------------

class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self._expense_repo = ExpenseRepository(db)
        self._income_repo = IncomeRepository(db)
        self._budget_repo = BudgetRepository(db)
        self._goal_repo = GoalRepository(db)
        self._contribution_repo = GoalContributionRepository(db)

    # ── Internal helpers ────────────────────────────────────────────────────

    async def _expense_category_breakdown(
        self, user_id: uuid.UUID, start: date, end: date, total: float
    ) -> List[CategoryBreakdown]:
        result = await self.db.execute(
            select(
                Expense.category_id.label("category_id"),
                func.coalesce(Category.name, "Uncategorized").label("category_name"),
                func.coalesce(func.sum(Expense.amount), 0).label("total_amount"),
                func.count(Expense.id).label("tx_count"),
            )
            .outerjoin(Category, Expense.category_id == Category.id)
            .where(and_(
                Expense.user_id == user_id,
                Expense.date >= start,
                Expense.date <= end,
            ))
            .group_by(Expense.category_id, Category.name)
            .order_by(func.sum(Expense.amount).desc())
        )
        return [
            CategoryBreakdown(
                category_id=r.category_id,
                category_name=r.category_name,
                total_amount=_round2(float(r.total_amount)),
                transaction_count=r.tx_count,
                percentage=_pct(float(r.total_amount), total),
            )
            for r in result.all()
        ]

    async def _income_category_breakdown(
        self, user_id: uuid.UUID, start: date, end: date, total: float
    ) -> List[CategoryBreakdown]:
        result = await self.db.execute(
            select(
                Income.category_id.label("category_id"),
                func.coalesce(Category.name, "Uncategorized").label("category_name"),
                func.coalesce(func.sum(Income.amount), 0).label("total_amount"),
                func.count(Income.id).label("tx_count"),
            )
            .outerjoin(Category, Income.category_id == Category.id)
            .where(and_(
                Income.user_id == user_id,
                Income.date >= start,
                Income.date <= end,
            ))
            .group_by(Income.category_id, Category.name)
            .order_by(func.sum(Income.amount).desc())
        )
        return [
            CategoryBreakdown(
                category_id=r.category_id,
                category_name=r.category_name,
                total_amount=_round2(float(r.total_amount)),
                transaction_count=r.tx_count,
                percentage=_pct(float(r.total_amount), total),
            )
            for r in result.all()
        ]

    async def _payment_method_breakdown(
        self, user_id: uuid.UUID, start: date, end: date, total: float
    ) -> List[PaymentMethodBreakdown]:
        result = await self.db.execute(
            select(
                Expense.payment_method,
                func.coalesce(func.sum(Expense.amount), 0).label("total_amount"),
                func.count(Expense.id).label("tx_count"),
            )
            .where(and_(
                Expense.user_id == user_id,
                Expense.date >= start,
                Expense.date <= end,
            ))
            .group_by(Expense.payment_method)
            .order_by(func.sum(Expense.amount).desc())
        )
        return [
            PaymentMethodBreakdown(
                payment_method=r.payment_method or "Unknown",
                total_amount=_round2(float(r.total_amount)),
                transaction_count=r.tx_count,
                percentage=_pct(float(r.total_amount), total),
            )
            for r in result.all()
        ]

    async def _income_source_breakdown(
        self, user_id: uuid.UUID, start: date, end: date, total: float
    ) -> List[SourceBreakdown]:
        result = await self.db.execute(
            select(
                Income.source,
                func.coalesce(func.sum(Income.amount), 0).label("total_amount"),
                func.count(Income.id).label("tx_count"),
            )
            .where(and_(
                Income.user_id == user_id,
                Income.date >= start,
                Income.date <= end,
            ))
            .group_by(Income.source)
            .order_by(func.sum(Income.amount).desc())
        )
        return [
            SourceBreakdown(
                source=r.source or "Unknown",
                total_amount=_round2(float(r.total_amount)),
                transaction_count=r.tx_count,
                percentage=_pct(float(r.total_amount), total),
            )
            for r in result.all()
        ]

    async def _daily_expense_trend(
        self, user_id: uuid.UUID, start: date, end: date
    ) -> List[DailyTrend]:
        result = await self.db.execute(
            select(
                Expense.date.label("day"),
                func.coalesce(func.sum(Expense.amount), 0).label("total_amount"),
                func.count(Expense.id).label("tx_count"),
            )
            .where(and_(
                Expense.user_id == user_id,
                Expense.date >= start,
                Expense.date <= end,
            ))
            .group_by(Expense.date)
            .order_by(Expense.date.asc())
        )
        return [
            DailyTrend(
                date=r.day,
                total_amount=_round2(float(r.total_amount)),
                transaction_count=r.tx_count,
            )
            for r in result.all()
        ]

    async def _top_expenses(
        self, user_id: uuid.UUID, start: date, end: date, limit: int = 10
    ) -> List[TopTransaction]:
        result = await self.db.execute(
            select(Expense)
            .options(selectinload(Expense.category))
            .where(and_(
                Expense.user_id == user_id,
                Expense.date >= start,
                Expense.date <= end,
            ))
            .order_by(Expense.amount.desc())
            .limit(limit)
        )
        return [
            TopTransaction(
                id=r.id,
                amount=_round2(float(r.amount)),
                date=r.date,
                description=r.description or r.merchant,
                category_name=r.category.name if r.category else None,
            )
            for r in result.scalars().all()
        ]

    async def _top_income(
        self, user_id: uuid.UUID, start: date, end: date, limit: int = 10
    ) -> List[TopTransaction]:
        result = await self.db.execute(
            select(Income)
            .options(selectinload(Income.category))
            .where(and_(
                Income.user_id == user_id,
                Income.date >= start,
                Income.date <= end,
            ))
            .order_by(Income.amount.desc())
            .limit(limit)
        )
        return [
            TopTransaction(
                id=r.id,
                amount=_round2(float(r.amount)),
                date=r.date,
                description=r.description or r.source,
                category_name=r.category.name if r.category else None,
            )
            for r in result.scalars().all()
        ]

    async def _monthly_expense_total(self, user_id: uuid.UUID, year: int, month: int) -> float:
        return await self._expense_repo.get_monthly_summary(user_id, year, month)

    async def _monthly_income_total(self, user_id: uuid.UUID, year: int, month: int) -> float:
        return await self._income_repo.get_monthly_summary(user_id, year, month)

    async def _monthly_savings_contributions(
        self, user_id: uuid.UUID, year: int, month: int
    ) -> float:
        start, end = _month_range(year, month)
        result = await self.db.execute(
            select(func.coalesce(func.sum(GoalContribution.amount), 0))
            .join(Goal, GoalContribution.goal_id == Goal.id)
            .where(and_(
                Goal.user_id == user_id,
                GoalContribution.date >= start,
                GoalContribution.date <= end,
            ))
        )
        return _round2(float(result.scalar() or 0.0))

    # ── Report 1: Monthly ──────────────────────────────────────────────────

    async def monthly_report(
        self, user_id: uuid.UUID, year: int, month: int, currency: str
    ) -> MonthlyReportResponse:
        start, end = _month_range(year, month)

        income_stats = await self._income_repo.get_statistics(user_id, start, end)
        expense_stats = await self._expense_repo.get_statistics(user_id, start, end)
        total_income = _round2(income_stats["total_amount"])
        total_expenses = _round2(expense_stats["total_amount"])
        savings_contribs = await self._monthly_savings_contributions(user_id, year, month)
        net_balance = _round2(total_income - total_expenses)
        savings_rate = _pct(savings_contribs, total_income)

        expense_by_category = await self._expense_category_breakdown(user_id, start, end, total_expenses)
        income_by_category = await self._income_category_breakdown(user_id, start, end, total_income)

        raw_budgets = await self._budget_repo.list_all_budget_utilizations(user_id, start)
        budget_util = [_build_budget_util_item(row) for row in raw_budgets]

        return MonthlyReportResponse(
            year=year,
            month=month,
            currency=currency,
            total_income=total_income,
            total_expenses=total_expenses,
            net_balance=net_balance,
            savings_contributions=savings_contribs,
            savings_rate=savings_rate,
            income_transaction_count=income_stats["total_transactions"],
            expense_transaction_count=expense_stats["total_transactions"],
            budget_utilization=budget_util,
            expense_by_category=expense_by_category,
            income_by_category=income_by_category,
        )

    # ── Report 2: Yearly ───────────────────────────────────────────────────

    async def yearly_report(
        self, user_id: uuid.UUID, year: int, currency: str
    ) -> YearlyReportResponse:
        year_start = date(year, 1, 1)
        year_end = date(year, 12, 31)

        # Single query: income grouped by month
        income_result = await self.db.execute(
            select(
                extract("month", Income.date).label("month"),
                func.coalesce(func.sum(Income.amount), 0).label("total"),
            )
            .where(and_(
                Income.user_id == user_id,
                Income.date >= year_start,
                Income.date <= year_end,
            ))
            .group_by(extract("month", Income.date))
        )
        income_map = {int(r.month): float(r.total) for r in income_result.all()}

        # Single query: expenses grouped by month
        expense_result = await self.db.execute(
            select(
                extract("month", Expense.date).label("month"),
                func.coalesce(func.sum(Expense.amount), 0).label("total"),
            )
            .where(and_(
                Expense.user_id == user_id,
                Expense.date >= year_start,
                Expense.date <= year_end,
            ))
            .group_by(extract("month", Expense.date))
        )
        expense_map = {int(r.month): float(r.total) for r in expense_result.all()}

        # Single query: savings contributions grouped by month
        savings_result = await self.db.execute(
            select(
                extract("month", GoalContribution.date).label("month"),
                func.coalesce(func.sum(GoalContribution.amount), 0).label("total"),
            )
            .join(Goal, GoalContribution.goal_id == Goal.id)
            .where(and_(
                Goal.user_id == user_id,
                GoalContribution.date >= year_start,
                GoalContribution.date <= year_end,
            ))
            .group_by(extract("month", GoalContribution.date))
        )
        savings_map = {int(r.month): float(r.total) for r in savings_result.all()}

        monthly_data: List[MonthlyTrend] = []
        total_income = total_expenses = total_savings = 0.0

        for month in range(1, 13):
            mo_income = income_map.get(month, 0.0)
            mo_expenses = expense_map.get(month, 0.0)
            mo_savings = savings_map.get(month, 0.0)
            monthly_data.append(MonthlyTrend(
                year=year, month=month,
                income=_round2(mo_income),
                expenses=_round2(mo_expenses),
                net=_round2(mo_income - mo_expenses),
                savings_contributions=_round2(mo_savings),
            ))
            total_income += mo_income
            total_expenses += mo_expenses
            total_savings += mo_savings

        return YearlyReportResponse(
            year=year,
            currency=currency,
            total_income=_round2(total_income),
            total_expenses=_round2(total_expenses),
            net_balance=_round2(total_income - total_expenses),
            total_savings_contributions=_round2(total_savings),
            average_monthly_income=_round2(total_income / 12),
            average_monthly_expenses=_round2(total_expenses / 12),
            monthly_breakdown=monthly_data,
        )


    # ── Report 3: Expense ──────────────────────────────────────────────────

    async def expense_report(
        self, user_id: uuid.UUID, start: date, end: date, currency: str
    ) -> ExpenseReportResponse:
        stats = await self._expense_repo.get_statistics(user_id, start, end)
        total = _round2(stats["total_amount"])

        return ExpenseReportResponse(
            start_date=start,
            end_date=end,
            currency=currency,
            total_expenses=total,
            transaction_count=stats["total_transactions"],
            average_expense=_round2(stats["average_amount"]),
            largest_expense=_round2(stats["max_amount"]),
            smallest_expense=_round2(stats["min_amount"]),
            by_category=await self._expense_category_breakdown(user_id, start, end, total),
            by_payment_method=await self._payment_method_breakdown(user_id, start, end, total),
            daily_trend=await self._daily_expense_trend(user_id, start, end),
            top_expenses=await self._top_expenses(user_id, start, end),
        )

    # ── Report 4: Income ───────────────────────────────────────────────────

    async def income_report(
        self, user_id: uuid.UUID, start: date, end: date, currency: str
    ) -> IncomeReportResponse:
        stats = await self._income_repo.get_statistics(user_id, start, end)
        total = _round2(stats["total_amount"])

        # Build monthly trend within range
        monthly_trend: List[MonthlyTrend] = []
        seen: Set[tuple] = set()
        cur = date(start.year, start.month, 1)
        while cur <= end:
            key = (cur.year, cur.month)
            if key not in seen:
                seen.add(key)
                mo_income = await self._monthly_income_total(user_id, cur.year, cur.month)
                monthly_trend.append(MonthlyTrend(
                    year=cur.year, month=cur.month,
                    income=_round2(mo_income),
                    expenses=0.0, net=_round2(mo_income),
                    savings_contributions=0.0,
                ))
            cur = date(cur.year + (1 if cur.month == 12 else 0), (cur.month % 12) + 1, 1)

        return IncomeReportResponse(
            start_date=start,
            end_date=end,
            currency=currency,
            total_income=total,
            transaction_count=stats["total_transactions"],
            average_income=_round2(stats["average_amount"]),
            largest_income=_round2(stats["max_amount"]),
            smallest_income=_round2(stats["min_amount"]),
            by_category=await self._income_category_breakdown(user_id, start, end, total),
            by_source=await self._income_source_breakdown(user_id, start, end, total),
            monthly_trend=monthly_trend,
            top_income_entries=await self._top_income(user_id, start, end),
        )

    # ── Report 5: Budget ───────────────────────────────────────────────────

    async def budget_report(
        self, user_id: uuid.UUID, year: int, month: int, currency: str
    ) -> BudgetReportResponse:
        target_date = date(year, month, 1)
        raw_budgets = await self._budget_repo.list_all_budget_utilizations(user_id, target_date)
        budget_items = [_build_budget_util_item(row) for row in raw_budgets]
        over_budget = [b for b in budget_items if b.is_over_budget]

        total_budgeted = _round2(sum(b.budget_amount for b in budget_items))
        total_utilized = _round2(sum(b.utilized_amount for b in budget_items))

        return BudgetReportResponse(
            year=year,
            month=month,
            currency=currency,
            total_budgeted=total_budgeted,
            total_utilized=total_utilized,
            total_remaining=_round2(total_budgeted - total_utilized),
            overall_utilization_percentage=_pct(total_utilized, total_budgeted),
            budgets=budget_items,
            over_budget_categories=over_budget,
            within_budget_count=len(budget_items) - len(over_budget),
            over_budget_count=len(over_budget),
        )

    # ── Report 6: Savings Goal ─────────────────────────────────────────────

    async def savings_goal_report(
        self, user_id: uuid.UUID, currency: str
    ) -> SavingsGoalReportResponse:
        goals = await self._goal_repo.list_goals(user_id, skip=0, limit=1000)
        goal_items: List[GoalReportItem] = []

        for goal in goals:
            contribs_raw = await self._contribution_repo.list_contributions(str(goal.id), limit=1000)
            contribs = [
                GoalContributionItem(id=c.id, amount=_round2(float(c.amount)), date=c.date)
                for c in contribs_raw
            ]
            target = _round2(float(goal.target_amount))
            current = _round2(float(goal.current_amount))
            remaining = _round2(max(target - current, 0.0))
            goal_items.append(GoalReportItem(
                goal_id=goal.id,
                name=goal.name,
                target_amount=target,
                current_amount=current,
                remaining_amount=remaining,
                progress_percentage=_pct(current, target),
                deadline=goal.deadline,
                status=goal.status.value if hasattr(goal.status, "value") else str(goal.status),
                total_contributions=len(contribs),
                contributions=contribs,
            ))

        active = [g for g in goal_items if g.status == "ACTIVE"]
        completed = [g for g in goal_items if g.status == "COMPLETED"]
        total_target = _round2(sum(g.target_amount for g in goal_items))
        total_saved = _round2(sum(g.current_amount for g in goal_items))

        return SavingsGoalReportResponse(
            currency=currency,
            total_goals=len(goal_items),
            active_goals=len(active),
            completed_goals=len(completed),
            total_target_amount=total_target,
            total_saved_amount=total_saved,
            total_remaining_amount=_round2(sum(g.remaining_amount for g in goal_items)),
            overall_progress_percentage=_pct(total_saved, total_target),
            goals=goal_items,
        )

    # ── Report 7: Cash Flow ────────────────────────────────────────────────

    async def cash_flow_report(
        self, user_id: uuid.UUID, start: date, end: date, currency: str
    ) -> CashFlowReportResponse:
        monthly_entries: List[CashFlowEntry] = []
        total_income = total_expenses = total_savings = 0.0
        seen: Set[tuple] = set()
        cur = date(start.year, start.month, 1)

        while cur <= end:
            key = (cur.year, cur.month)
            if key not in seen:
                seen.add(key)
                mo_income = await self._monthly_income_total(user_id, cur.year, cur.month)
                mo_expenses = await self._monthly_expense_total(user_id, cur.year, cur.month)
                mo_savings = await self._monthly_savings_contributions(user_id, cur.year, cur.month)
                monthly_entries.append(CashFlowEntry(
                    year=cur.year, month=cur.month,
                    income=_round2(mo_income),
                    expenses=_round2(mo_expenses),
                    savings_contributions=_round2(mo_savings),
                    net_cash_flow=_round2(mo_income - mo_expenses),
                ))
                total_income += mo_income
                total_expenses += mo_expenses
                total_savings += mo_savings
            cur = date(cur.year + (1 if cur.month == 12 else 0), (cur.month % 12) + 1, 1)

        return CashFlowReportResponse(
            start_date=start,
            end_date=end,
            currency=currency,
            total_income=_round2(total_income),
            total_expenses=_round2(total_expenses),
            total_savings_contributions=_round2(total_savings),
            net_cash_flow=_round2(total_income - total_expenses),
            monthly_breakdown=monthly_entries,
        )
