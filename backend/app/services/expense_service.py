import uuid
from typing import Optional, Sequence
from datetime import date
from app.models.expense import Expense
from app.schemas.expense_schema import ExpenseCreate, ExpenseUpdate
from app.repositories.expense_repository import ExpenseRepository
from app.core.exceptions import BadRequestException, NotFoundException

class ExpenseService:
    def __init__(self, repository: ExpenseRepository):
        self.repository = repository

    async def create_expense(self, user_id: uuid.UUID, expense_in: ExpenseCreate) -> Expense:
        if expense_in.amount <= 0:
            raise BadRequestException("Expense amount must be strictly positive.")
            
        return await self.repository.create_expense(user_id, expense_in)

    async def get_expense(self, expense_id: str, user_id: uuid.UUID) -> Expense:
        expense = await self.repository.get_expense(expense_id, user_id)
        if not expense:
            raise NotFoundException("Expense not found")
        return expense

    async def list_expenses(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[uuid.UUID] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        search_query: Optional[str] = None
    ) -> Sequence[Expense]:
        if skip < 0 or limit <= 0:
            raise BadRequestException("Invalid pagination parameters.")
        limit = min(limit, 500)
        return await self.repository.list_expenses(
            user_id=user_id,
            skip=skip,
            limit=limit,
            category_id=category_id,
            start_date=start_date,
            end_date=end_date,
            min_amount=min_amount,
            max_amount=max_amount,
            search_query=search_query
        )

    async def update_expense(self, expense_id: str, user_id: uuid.UUID, expense_in: ExpenseUpdate) -> Expense:
        if expense_in.amount is not None and expense_in.amount <= 0:
            raise BadRequestException("Expense amount must be strictly positive.")
            
        expense = await self.repository.update_expense(expense_id, user_id, expense_in)
        if not expense:
            raise NotFoundException("Expense not found")
        return expense

    async def delete_expense(self, expense_id: str, user_id: uuid.UUID) -> bool:
        success = await self.repository.delete_expense(expense_id, user_id)
        if not success:
            raise NotFoundException("Expense not found")
        return success

    async def search_expenses(self, user_id: uuid.UUID, query: str, skip: int = 0, limit: int = 100) -> Sequence[Expense]:
        if not query or len(query.strip()) == 0:
            raise BadRequestException("Search query cannot be empty.")
        return await self.repository.search_expenses(user_id, query.strip(), skip=skip, limit=limit)

    async def filter_by_category(self, user_id: uuid.UUID, category_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Sequence[Expense]:
        if not category_id:
            raise BadRequestException("Category cannot be empty.")
        return await self.repository.filter_by_category(user_id, category_id, skip=skip, limit=limit)

    async def filter_by_date(self, user_id: uuid.UUID, start_date: date, end_date: date, skip: int = 0, limit: int = 100) -> Sequence[Expense]:
        if start_date > end_date:
            raise BadRequestException("Start date cannot be after end date.")
        return await self.repository.filter_by_date(user_id, start_date, end_date, skip=skip, limit=limit)

    async def filter_by_amount(self, user_id: uuid.UUID, min_amount: float, max_amount: float, skip: int = 0, limit: int = 100) -> Sequence[Expense]:
        if min_amount < 0 or max_amount < 0:
            raise BadRequestException("Amounts must be non-negative.")
        if min_amount > max_amount:
            raise BadRequestException("Minimum amount cannot be greater than maximum amount.")
        return await self.repository.filter_by_amount(user_id, min_amount, max_amount, skip=skip, limit=limit)

    async def get_monthly_summary(self, user_id: uuid.UUID, year: int, month: int) -> float:
        if month < 1 or month > 12:
            raise BadRequestException("Invalid month.")
        return await self.repository.get_monthly_summary(user_id, year, month)

    async def get_statistics(self, user_id: uuid.UUID, start_date: date, end_date: date) -> dict:
        if start_date > end_date:
            raise BadRequestException("Start date cannot be after end date.")
        return await self.repository.get_statistics(user_id, start_date, end_date)
