from __future__ import annotations
from typing import List, Optional
from uuid import UUID
from datetime import date
from pydantic import BaseModel, Field, ConfigDict

class CategoryBreakdown(BaseModel):
    category_id: Optional[UUID] = None
    category_name: str
    total_amount: float = Field(..., ge=0)
    transaction_count: int = Field(..., ge=0)
    percentage: float = Field(..., ge=0, le=100)
    model_config = ConfigDict(from_attributes=True)

class PaymentMethodBreakdown(BaseModel):
    payment_method: str
    total_amount: float = Field(..., ge=0)
    transaction_count: int = Field(..., ge=0)
    percentage: float = Field(..., ge=0, le=100)
    model_config = ConfigDict(from_attributes=True)

class SourceBreakdown(BaseModel):
    source: str
    total_amount: float = Field(..., ge=0)
    transaction_count: int = Field(..., ge=0)
    percentage: float = Field(..., ge=0, le=100)
    model_config = ConfigDict(from_attributes=True)

class DailyTrend(BaseModel):
    date: date
    total_amount: float = Field(..., ge=0)
    transaction_count: int = Field(..., ge=0)
    model_config = ConfigDict(from_attributes=True)

class MonthlyTrend(BaseModel):
    year: int
    month: int
    income: float = Field(0.0, ge=0)
    expenses: float = Field(0.0, ge=0)
    net: float
    savings_contributions: float = Field(0.0, ge=0)
    model_config = ConfigDict(from_attributes=True)

class TopTransaction(BaseModel):
    id: UUID
    amount: float
    date: date
    description: Optional[str] = None
    category_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class BudgetUtilizationItem(BaseModel):
    budget_id: UUID
    category_id: UUID
    category_name: str
    budget_amount: float = Field(..., ge=0)
    utilized_amount: float = Field(..., ge=0)
    remaining_amount: float
    utilization_percentage: float
    is_over_budget: bool
    model_config = ConfigDict(from_attributes=True)

class GoalContributionItem(BaseModel):
    id: UUID
    amount: float
    date: date
    model_config = ConfigDict(from_attributes=True)

class GoalReportItem(BaseModel):
    goal_id: UUID
    name: str
    target_amount: float
    current_amount: float
    remaining_amount: float
    progress_percentage: float
    deadline: Optional[date] = None
    status: str
    total_contributions: int
    contributions: List[GoalContributionItem] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)

class CashFlowEntry(BaseModel):
    year: int
    month: int
    income: float = Field(0.0, ge=0)
    expenses: float = Field(0.0, ge=0)
    savings_contributions: float = Field(0.0, ge=0)
    net_cash_flow: float
    model_config = ConfigDict(from_attributes=True)

class MonthlyReportResponse(BaseModel):
    year: int
    month: int
    currency: str
    total_income: float = Field(0.0, ge=0)
    total_expenses: float = Field(0.0, ge=0)
    net_balance: float
    savings_contributions: float = Field(0.0, ge=0)
    savings_rate: float = Field(0.0)
    income_transaction_count: int = Field(0, ge=0)
    expense_transaction_count: int = Field(0, ge=0)
    budget_utilization: List[BudgetUtilizationItem] = Field(default_factory=list)
    expense_by_category: List[CategoryBreakdown] = Field(default_factory=list)
    income_by_category: List[CategoryBreakdown] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)

class YearlyReportResponse(BaseModel):
    year: int
    currency: str
    total_income: float = Field(0.0, ge=0)
    total_expenses: float = Field(0.0, ge=0)
    net_balance: float
    total_savings_contributions: float = Field(0.0, ge=0)
    average_monthly_income: float = Field(0.0, ge=0)
    average_monthly_expenses: float = Field(0.0, ge=0)
    monthly_breakdown: List[MonthlyTrend] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)

class ExpenseReportResponse(BaseModel):
    start_date: date
    end_date: date
    currency: str
    total_expenses: float = Field(0.0, ge=0)
    transaction_count: int = Field(0, ge=0)
    average_expense: float = Field(0.0, ge=0)
    largest_expense: float = Field(0.0, ge=0)
    smallest_expense: float = Field(0.0, ge=0)
    by_category: List[CategoryBreakdown] = Field(default_factory=list)
    by_payment_method: List[PaymentMethodBreakdown] = Field(default_factory=list)
    daily_trend: List[DailyTrend] = Field(default_factory=list)
    top_expenses: List[TopTransaction] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)

class IncomeReportResponse(BaseModel):
    start_date: date
    end_date: date
    currency: str
    total_income: float = Field(0.0, ge=0)
    transaction_count: int = Field(0, ge=0)
    average_income: float = Field(0.0, ge=0)
    largest_income: float = Field(0.0, ge=0)
    smallest_income: float = Field(0.0, ge=0)
    by_category: List[CategoryBreakdown] = Field(default_factory=list)
    by_source: List[SourceBreakdown] = Field(default_factory=list)
    monthly_trend: List[MonthlyTrend] = Field(default_factory=list)
    top_income_entries: List[TopTransaction] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)

class BudgetReportResponse(BaseModel):
    year: int
    month: int
    currency: str
    total_budgeted: float = Field(0.0, ge=0)
    total_utilized: float = Field(0.0, ge=0)
    total_remaining: float
    overall_utilization_percentage: float
    budgets: List[BudgetUtilizationItem] = Field(default_factory=list)
    over_budget_categories: List[BudgetUtilizationItem] = Field(default_factory=list)
    within_budget_count: int = Field(0, ge=0)
    over_budget_count: int = Field(0, ge=0)
    model_config = ConfigDict(from_attributes=True)

class SavingsGoalReportResponse(BaseModel):
    currency: str
    total_goals: int = Field(0, ge=0)
    active_goals: int = Field(0, ge=0)
    completed_goals: int = Field(0, ge=0)
    total_target_amount: float = Field(0.0, ge=0)
    total_saved_amount: float = Field(0.0, ge=0)
    total_remaining_amount: float = Field(0.0, ge=0)
    overall_progress_percentage: float
    goals: List[GoalReportItem] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)

class CashFlowReportResponse(BaseModel):
    start_date: date
    end_date: date
    currency: str
    total_income: float = Field(0.0, ge=0)
    total_expenses: float = Field(0.0, ge=0)
    total_savings_contributions: float = Field(0.0, ge=0)
    net_cash_flow: float
    monthly_breakdown: List[CashFlowEntry] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)
