from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.schemas.budget_schema import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetUtilizationResponse
from app.repositories.budget_repository import BudgetRepository
from app.services.budget_service import BudgetService

router = APIRouter(tags=["Budget"])

def get_budget_service(db: AsyncSession = Depends(get_db_session)) -> BudgetService:
    repository = BudgetRepository(db)
    return BudgetService(repository)

@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service)
):
    """Create a new budget."""
    return await service.create_budget(current_user.id, budget_in)

@router.get("", response_model=List[BudgetResponse])
async def list_budgets(
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service)
):
    """List all budgets for the user."""
    return await service.list_budgets(current_user.id)

@router.get("/{id}", response_model=BudgetResponse)
async def get_budget(
    id: str,
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service)
):
    """Get a specific budget by ID."""
    return await service.get_budget(id, current_user.id)

@router.put("/{id}", response_model=BudgetResponse)
async def update_budget(
    id: str,
    budget_in: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service)
):
    """Update a specific budget by ID."""
    return await service.update_budget(id, current_user.id, budget_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    id: str,
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service)
):
    """Delete a specific budget by ID."""
    await service.delete_budget(id, current_user.id)

@router.get("/{id}/utilization", response_model=BudgetUtilizationResponse)
async def get_budget_utilization(
    id: str,
    target_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    service: BudgetService = Depends(get_budget_service)
):
    """Get the budget utilization, total amount, and remaining amount for a specific month."""
    if not target_date:
        target_date = date.today()
    return await service.get_budget_utilization(id, current_user.id, target_date)
