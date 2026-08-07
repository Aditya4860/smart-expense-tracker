from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, Query, status, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.models.enums import TransactionType, RecurringStatus
from app.schemas.recurring_transaction_schema import (
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
    RecurringTransactionResponse,
    RecurringProcessResult,
    RecurringCountResponse,
)
from app.repositories.recurring_transaction_repository import RecurringTransactionRepository
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.income_repository import IncomeRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.notification_repository import NotificationRepository
from app.services.recurring_transaction_service import RecurringTransactionService

router = APIRouter(tags=["Recurring Transactions"])

def get_recurring_service(db: AsyncSession = Depends(get_db_session)) -> RecurringTransactionService:
    repo = RecurringTransactionRepository(db)
    expense_repo = ExpenseRepository(db)
    income_repo = IncomeRepository(db)
    category_repo = CategoryRepository(db)
    notification_repo = NotificationRepository(db)
    return RecurringTransactionService(
        repository=repo,
        expense_repository=expense_repo,
        income_repository=income_repo,
        category_repository=category_repo,
        notification_repository=notification_repo,
    )

@router.post("", response_model=RecurringTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_recurring_transaction(
    recurring_in: RecurringTransactionCreate,
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """Create a new recurring income or expense schedule."""
    return await service.create_recurring_transaction(current_user.id, recurring_in)

@router.get("", response_model=List[RecurringTransactionResponse])
async def list_recurring_transactions(
    type: Optional[TransactionType] = Query(None, description="Filter by transaction type (INCOME/EXPENSE)"),
    status: Optional[RecurringStatus] = Query(None, description="Filter by schedule status (ACTIVE/PAUSED/CANCELLED/COMPLETED)"),
    category_id: Optional[UUID] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search term in title, merchant, or description"),
    sort: str = Query("asc", description="Sort order by next_date ('asc' or 'desc')"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0, le=500),
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """List recurring transaction schedules with optional filtering, searching, and pagination."""
    return await service.list_recurring_transactions(
        user_id=current_user.id,
        type=type.value if type else None,
        status=status.value if status else None,
        category_id=category_id,
        search=search,
        sort=sort,
        skip=skip,
        limit=limit,
    )

@router.get("/counts", response_model=RecurringCountResponse)
async def get_recurring_counts(
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """Get active, paused, and total recurring transaction counts."""
    return await service.get_counts(current_user.id)

@router.post("/process-due", response_model=RecurringProcessResult)
async def process_all_due_recurring_transactions(
    target_date: Optional[date] = Query(None, description="Target execution date (defaults to today)"),
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """
    Process all active recurring schedules that are due on or before target date.
    Automatically generates Expense/Income records, updates dashboard/analytics/budgets/goals,
    and sends in-app notifications.
    """
    return await service.process_all_due(current_user.id, target_date)

@router.get("/{id}", response_model=RecurringTransactionResponse)
async def get_recurring_transaction(
    id: UUID = Path(..., description="The ID of the recurring transaction"),
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """Get details of a recurring transaction schedule."""
    return await service.get_recurring_transaction(str(id), current_user.id)

@router.put("/{id}", response_model=RecurringTransactionResponse)
async def update_recurring_transaction(
    recurring_in: RecurringTransactionUpdate,
    id: UUID = Path(..., description="The ID of the recurring transaction"),
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """Update a recurring transaction schedule."""
    return await service.update_recurring_transaction(str(id), current_user.id, recurring_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recurring_transaction(
    id: UUID = Path(..., description="The ID of the recurring transaction"),
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """Delete a recurring transaction schedule."""
    await service.delete_recurring_transaction(str(id), current_user.id)
    return None

@router.post("/{id}/pause", response_model=RecurringTransactionResponse)
async def pause_recurring_transaction(
    id: UUID = Path(..., description="The ID of the recurring transaction"),
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """Pause a recurring transaction schedule."""
    return await service.pause_recurring_transaction(str(id), current_user.id)

@router.post("/{id}/resume", response_model=RecurringTransactionResponse)
async def resume_recurring_transaction(
    id: UUID = Path(..., description="The ID of the recurring transaction"),
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """Resume a paused recurring transaction schedule."""
    return await service.resume_recurring_transaction(str(id), current_user.id)

@router.post("/{id}/cancel", response_model=RecurringTransactionResponse)
async def cancel_recurring_transaction(
    id: UUID = Path(..., description="The ID of the recurring transaction"),
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """Cancel a recurring transaction schedule."""
    return await service.cancel_recurring_transaction(str(id), current_user.id)

@router.post("/{id}/skip", response_model=RecurringTransactionResponse)
async def skip_recurring_occurrence(
    id: UUID = Path(..., description="The ID of the recurring transaction"),
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """Skip the next occurrence without generating a transaction."""
    return await service.skip_occurrence(str(id), current_user.id)

@router.post("/{id}/process", response_model=Dict[str, Any])
async def process_recurring_occurrence(
    id: UUID = Path(..., description="The ID of the recurring transaction"),
    occurrence_date: Optional[date] = Query(None, description="Specific occurrence date (defaults to next_date)"),
    current_user: User = Depends(get_current_user),
    service: RecurringTransactionService = Depends(get_recurring_service),
):
    """Manually trigger and execute the next occurrence immediately."""
    return await service.process_occurrence(str(id), current_user.id, occurrence_date)
