import uuid
from typing import Optional, Sequence
from datetime import date
from app.models.budget import Budget
from app.schemas.budget_schema import BudgetCreate, BudgetUpdate, BudgetUtilizationResponse
from app.repositories.budget_repository import BudgetRepository
from app.core.exceptions import BadRequestException, NotFoundException

class BudgetService:
    def __init__(self, repository: BudgetRepository):
        self.repository = repository

    async def create_budget(self, user_id: uuid.UUID, budget_in: BudgetCreate) -> Budget:
        if budget_in.amount <= 0:
            raise BadRequestException("Budget amount must be strictly positive.")
            
        return await self.repository.create_budget(user_id, budget_in)

    async def get_budget(self, budget_id: str, user_id: uuid.UUID) -> Budget:
        budget = await self.repository.get_budget(budget_id, user_id)
        if not budget:
            raise NotFoundException("Budget not found")
        return budget

    async def list_budgets(self, user_id: uuid.UUID) -> Sequence[Budget]:
        return await self.repository.list_budgets(user_id)

    async def update_budget(self, budget_id: str, user_id: uuid.UUID, budget_in: BudgetUpdate) -> Budget:
        if budget_in.amount is not None and budget_in.amount <= 0:
            raise BadRequestException("Budget amount must be strictly positive.")
            
        budget = await self.repository.update_budget(budget_id, user_id, budget_in)
        if not budget:
            raise NotFoundException("Budget not found")
        return budget

    async def delete_budget(self, budget_id: str, user_id: uuid.UUID) -> bool:
        success = await self.repository.delete_budget(budget_id, user_id)
        if not success:
            raise NotFoundException("Budget not found")
        return success
        
    async def get_budget_utilization(self, budget_id: str, user_id: uuid.UUID, target_date: date) -> BudgetUtilizationResponse:
        utilization = await self.repository.get_budget_utilization(budget_id, user_id, target_date)
        if not utilization:
            raise NotFoundException("Budget not found")
        return BudgetUtilizationResponse(**utilization)
