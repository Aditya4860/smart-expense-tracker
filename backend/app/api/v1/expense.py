from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.schemas.expense_schema import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.repositories.expense_repository import ExpenseRepository
from app.services.expense_service import ExpenseService

router = APIRouter(tags=["Expenses"])

def get_expense_service(db: AsyncSession = Depends(get_db_session)) -> ExpenseService:
    repository = ExpenseRepository(db)
    return ExpenseService(repository)

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_in: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service)
):
    """Create a new expense."""
    return await service.create_expense(current_user.id, expense_in)

@router.get("", response_model=List[ExpenseResponse])
async def list_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0, le=1000),
    category_id: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service)
):
    """List expenses with composable filtering and pagination."""
    cat_id = category_id or category
    return await service.list_expenses(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        category_id=cat_id,
        start_date=start_date,
        end_date=end_date,
        min_amount=min_amount,
        max_amount=max_amount,
        search_query=search
    )

@router.get("/search", response_model=List[ExpenseResponse])
async def search_expenses(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service)
):
    """Search expenses by title."""
    return await service.search_expenses(current_user.id, q)

@router.get("/statistics")
async def get_statistics(
    start_date: date,
    end_date: date,
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service)
):
    """Get expense statistics for a date range."""
    return await service.get_statistics(current_user.id, start_date, end_date)

@router.get("/monthly-summary")
async def get_monthly_summary(
    year: int,
    month: int = Query(..., ge=1, le=12),
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service)
):
    """Get monthly summary of expenses."""
    amount = await service.get_monthly_summary(current_user.id, year, month)
    return {"year": year, "month": month, "total_amount": amount}

@router.get("/{id}", response_model=ExpenseResponse)
async def get_expense(
    id: str,
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service)
):
    """Get a specific expense by ID."""
    return await service.get_expense(id, current_user.id)

@router.put("/{id}", response_model=ExpenseResponse)
async def update_expense(
    id: str,
    expense_in: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service)
):
    """Update a specific expense by ID."""
    return await service.update_expense(id, current_user.id, expense_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    id: str,
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service)
):
    """Delete a specific expense by ID."""
    await service.delete_expense(id, current_user.id)
