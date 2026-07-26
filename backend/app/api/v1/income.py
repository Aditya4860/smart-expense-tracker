from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.schemas.income_schema import IncomeCreate, IncomeUpdate, IncomeResponse
from app.repositories.income_repository import IncomeRepository
from app.services.income_service import IncomeService

router = APIRouter(tags=["Income"])

def get_income_service(db: AsyncSession = Depends(get_db_session)) -> IncomeService:
    repository = IncomeRepository(db)
    return IncomeService(repository)

@router.post("", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_income(
    income_in: IncomeCreate,
    current_user: User = Depends(get_current_user),
    service: IncomeService = Depends(get_income_service)
):
    """Create a new income."""
    return await service.create_income(str(current_user.id), income_in)

@router.get("", response_model=List[IncomeResponse])
async def list_incomes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0, le=1000),
    category_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    service: IncomeService = Depends(get_income_service)
):
    """List incomes with optional filtering and pagination."""
    if category_id:
        return await service.filter_by_category(str(current_user.id), category_id)
    if start_date and end_date:
        return await service.filter_by_date(str(current_user.id), start_date, end_date)
    
    return await service.list_incomes(str(current_user.id), skip, limit)

@router.get("/search", response_model=List[IncomeResponse])
async def search_incomes(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    service: IncomeService = Depends(get_income_service)
):
    """Search incomes by source."""
    return await service.search_incomes(str(current_user.id), q)

@router.get("/statistics")
async def get_statistics(
    start_date: date,
    end_date: date,
    current_user: User = Depends(get_current_user),
    service: IncomeService = Depends(get_income_service)
):
    """Get income statistics for a date range."""
    return await service.get_statistics(str(current_user.id), start_date, end_date)

@router.get("/monthly-summary")
async def get_monthly_summary(
    year: int,
    month: int = Query(..., ge=1, le=12),
    current_user: User = Depends(get_current_user),
    service: IncomeService = Depends(get_income_service)
):
    """Get monthly summary of incomes."""
    amount = await service.get_monthly_summary(str(current_user.id), year, month)
    return {"year": year, "month": month, "total_amount": amount}

@router.get("/{id}", response_model=IncomeResponse)
async def get_income(
    id: str,
    current_user: User = Depends(get_current_user),
    service: IncomeService = Depends(get_income_service)
):
    """Get a specific income by ID."""
    return await service.get_income(id, str(current_user.id))

@router.put("/{id}", response_model=IncomeResponse)
async def update_income(
    id: str,
    income_in: IncomeUpdate,
    current_user: User = Depends(get_current_user),
    service: IncomeService = Depends(get_income_service)
):
    """Update a specific income by ID."""
    return await service.update_income(id, str(current_user.id), income_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income(
    id: str,
    current_user: User = Depends(get_current_user),
    service: IncomeService = Depends(get_income_service)
):
    """Delete a specific income by ID."""
    await service.delete_income(id, str(current_user.id))
