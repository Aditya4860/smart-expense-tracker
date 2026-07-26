import uuid
from typing import Optional, Sequence
from datetime import date
from app.models.income import Income
from app.schemas.income_schema import IncomeCreate, IncomeUpdate
from app.repositories.income_repository import IncomeRepository
from app.core.exceptions import BadRequestException, NotFoundException

class IncomeService:
    def __init__(self, repository: IncomeRepository):
        self.repository = repository

    async def create_income(self, user_id: uuid.UUID, income_in: IncomeCreate) -> Income:
        if income_in.amount <= 0:
            raise BadRequestException("Income amount must be strictly positive.")
            
        return await self.repository.create_income(user_id, income_in)

    async def get_income(self, income_id: str, user_id: uuid.UUID) -> Income:
        income = await self.repository.get_income(income_id, user_id)
        if not income:
            raise NotFoundException("Income not found")
        return income

    async def list_incomes(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> Sequence[Income]:
        if skip < 0 or limit <= 0:
            raise BadRequestException("Invalid pagination parameters.")
        return await self.repository.list_incomes(user_id, skip, limit)

    async def update_income(self, income_id: str, user_id: uuid.UUID, income_in: IncomeUpdate) -> Income:
        if income_in.amount is not None and income_in.amount <= 0:
            raise BadRequestException("Income amount must be strictly positive.")
            
        income = await self.repository.update_income(income_id, user_id, income_in)
        if not income:
            raise NotFoundException("Income not found")
        return income

    async def delete_income(self, income_id: str, user_id: uuid.UUID) -> bool:
        success = await self.repository.delete_income(income_id, user_id)
        if not success:
            raise NotFoundException("Income not found")
        return success

    async def search_incomes(self, user_id: uuid.UUID, query: str) -> Sequence[Income]:
        if not query or len(query.strip()) == 0:
            raise BadRequestException("Search query cannot be empty.")
        return await self.repository.search_incomes(user_id, query.strip())

    async def filter_by_category(self, user_id: uuid.UUID, category_id: str) -> Sequence[Income]:
        if not category_id:
            raise BadRequestException("Category ID cannot be empty.")
        return await self.repository.filter_by_category(user_id, category_id)

    async def filter_by_date(self, user_id: uuid.UUID, start_date: date, end_date: date) -> Sequence[Income]:
        if start_date > end_date:
            raise BadRequestException("Start date cannot be after end date.")
        return await self.repository.filter_by_date(user_id, start_date, end_date)

    async def get_monthly_summary(self, user_id: uuid.UUID, year: int, month: int) -> float:
        if month < 1 or month > 12:
            raise BadRequestException("Invalid month.")
        return await self.repository.get_monthly_summary(user_id, year, month)

    async def get_statistics(self, user_id: uuid.UUID, start_date: date, end_date: date) -> dict:
        if start_date > end_date:
            raise BadRequestException("Start date cannot be after end date.")
        return await self.repository.get_statistics(user_id, start_date, end_date)
