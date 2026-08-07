from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, Query, status, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.models.enums import ReminderType, ReminderFrequency, ReminderStatus
from app.schemas.reminder_schema import (
    ReminderCreate,
    ReminderUpdate,
    ReminderSnooze,
    ReminderResponse,
    ReminderCountResponse,
    ReminderHistoryResponse,
    ReminderProcessResult,
)
from app.repositories.reminder_repository import ReminderRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.notification_repository import NotificationRepository
from app.services.reminder_service import ReminderService

router = APIRouter(tags=["Reminders"])

def get_reminder_service(db: AsyncSession = Depends(get_db_session)) -> ReminderService:
    repo = ReminderRepository(db)
    category_repo = CategoryRepository(db)
    notification_repo = NotificationRepository(db)
    return ReminderService(
        repository=repo,
        category_repository=category_repo,
        notification_repository=notification_repo,
    )

@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    reminder_in: ReminderCreate,
    current_user: User = Depends(get_current_user),
    service: ReminderService = Depends(get_reminder_service),
):
    """Create a new financial or custom reminder."""
    return await service.create_reminder(current_user.id, reminder_in)

@router.get("", response_model=List[ReminderResponse])
async def list_reminders(
    type: Optional[ReminderType] = Query(None, description="Filter by reminder type"),
    status: Optional[ReminderStatus] = Query(None, description="Filter by status (PENDING, COMPLETED, SNOOZED, DISMISSED)"),
    frequency: Optional[ReminderFrequency] = Query(None, description="Filter by recurrence (ONCE, DAILY, WEEKLY, MONTHLY)"),
    from_date: Optional[date] = Query(None, description="Filter reminders due on or after date"),
    to_date: Optional[date] = Query(None, description="Filter reminders due on or before date"),
    search: Optional[str] = Query(None, description="Search term in title or description"),
    sort: str = Query("asc", description="Sort order by due_date ('asc' or 'desc')"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0, le=500),
    current_user: User = Depends(get_current_user),
    service: ReminderService = Depends(get_reminder_service),
):
    """List all reminders for the authenticated user with multi-criteria filtering."""
    return await service.list_reminders(
        user_id=current_user.id,
        type=type.value if type else None,
        status=status.value if status else None,
        frequency=frequency.value if frequency else None,
        from_date=from_date,
        to_date=to_date,
        search=search,
        sort=sort,
        skip=skip,
        limit=limit,
    )

@router.get("/counts", response_model=ReminderCountResponse)
async def get_reminder_counts(
    current_user: User = Depends(get_current_user),
    service: ReminderService = Depends(get_reminder_service),
):
    """Get counts of pending, overdue, completed, and total reminders."""
    return await service.get_counts(current_user.id)

@router.get("/history", response_model=List[ReminderHistoryResponse])
async def list_reminder_history(
    reminder_id: Optional[UUID] = Query(None, description="Filter history by reminder ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0, le=500),
    current_user: User = Depends(get_current_user),
    service: ReminderService = Depends(get_reminder_service),
):
    """List reminder execution and lifecycle history."""
    return await service.list_history(
        user_id=current_user.id, reminder_id=reminder_id, skip=skip, limit=limit
    )

@router.post("/process-due", response_model=ReminderProcessResult)
async def process_due_reminders(
    target_date: Optional[date] = Query(None, description="Date threshold for due reminders (defaults to today)"),
    current_user: User = Depends(get_current_user),
    service: ReminderService = Depends(get_reminder_service),
):
    """
    Check for due reminders, dispatch in-app notifications, and log execution history.
    """
    return await service.process_due_reminders(current_user.id, target_date)

@router.get("/{id}", response_model=ReminderResponse)
async def get_reminder(
    id: UUID = Path(..., description="Reminder UUID"),
    current_user: User = Depends(get_current_user),
    service: ReminderService = Depends(get_reminder_service),
):
    """Get single reminder with category and execution history."""
    return await service.get_reminder(str(id), current_user.id)

@router.put("/{id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_in: ReminderUpdate,
    id: UUID = Path(..., description="Reminder UUID"),
    current_user: User = Depends(get_current_user),
    service: ReminderService = Depends(get_reminder_service),
):
    """Update reminder details."""
    return await service.update_reminder(str(id), current_user.id, reminder_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    id: UUID = Path(..., description="Reminder UUID"),
    current_user: User = Depends(get_current_user),
    service: ReminderService = Depends(get_reminder_service),
):
    """Delete a reminder and its history."""
    await service.delete_reminder(str(id), current_user.id)
    return None

@router.post("/{id}/complete", response_model=ReminderResponse)
async def complete_reminder(
    id: UUID = Path(..., description="Reminder UUID"),
    current_user: User = Depends(get_current_user),
    service: ReminderService = Depends(get_reminder_service),
):
    """Mark reminder as completed (advances recurrence if repeating)."""
    return await service.complete_reminder(str(id), current_user.id)

@router.post("/{id}/snooze", response_model=ReminderResponse)
async def snooze_reminder(
    snooze_in: ReminderSnooze,
    id: UUID = Path(..., description="Reminder UUID"),
    current_user: User = Depends(get_current_user),
    service: ReminderService = Depends(get_reminder_service),
):
    """Snooze reminder by specified days or until target date."""
    return await service.snooze_reminder(str(id), current_user.id, snooze_in)

@router.post("/{id}/dismiss", response_model=ReminderResponse)
async def dismiss_reminder(
    id: UUID = Path(..., description="Reminder UUID"),
    current_user: User = Depends(get_current_user),
    service: ReminderService = Depends(get_reminder_service),
):
    """Dismiss reminder for current cycle."""
    return await service.dismiss_reminder(str(id), current_user.id)
