from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.models.enums import NotificationType
from app.schemas.notification_schema import NotificationCreate, NotificationResponse, NotificationCountResponse
from app.repositories.notification_repository import NotificationRepository
from app.services.notification_service import NotificationService

router = APIRouter(tags=["Notifications"])

def get_notification_service(db: AsyncSession = Depends(get_db_session)) -> NotificationService:
    repository = NotificationRepository(db)
    return NotificationService(repository)

@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification_in: NotificationCreate,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Create a new notification."""
    return await service.create_notification(str(current_user.id), notification_in)

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    unread_only: bool = Query(False, description="Filter only unread notifications"),
    type: Optional[str] = Query(None, description="Filter by notification type (e.g. BUDGET_EXCEEDED, GOAL_ACHIEVED)"),
    sort: str = Query("desc", description="Sort order by created_at ('desc' or 'asc')"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0, le=1000),
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """List all notifications for the authenticated user with optional filtering, sorting, and pagination."""
    return await service.list_notifications(
        user_id=str(current_user.id),
        unread_only=unread_only,
        notification_type=type,
        sort=sort,
        skip=skip,
        limit=limit
    )

@router.get("/unread-count", response_model=NotificationCountResponse)
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Get the count of unread and total notifications for the current user."""
    return await service.get_counts(str(current_user.id))

@router.post("/seed-demo", response_model=List[NotificationResponse])
async def seed_demo_notifications(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Seed sample notifications across all alert types for testing and interactive preview."""
    return await service.seed_sample_notifications(str(current_user.id))

@router.post("/mark-all-read", status_code=status.HTTP_200_OK)
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Mark all unread notifications as read."""
    await service.mark_all_as_read(str(current_user.id))
    return {"status": "success", "message": "All notifications marked as read."}

@router.post("/clear-read", status_code=status.HTTP_200_OK)
async def clear_read_notifications(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Delete all read notifications for the current user."""
    cleared = await service.clear_all_read(str(current_user.id))
    return {"status": "success", "message": f"Cleared {cleared} read notifications."}

@router.post("/{id}/mark-read", response_model=NotificationResponse)
async def mark_as_read(
    id: str,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Mark a specific notification as read."""
    return await service.mark_as_read(id, str(current_user.id))

@router.post("/{id}/mark-unread", response_model=NotificationResponse)
async def mark_as_unread(
    id: str,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Mark a specific notification as unread."""
    return await service.mark_as_unread(id, str(current_user.id))

@router.get("/{id}", response_model=NotificationResponse)
async def get_notification(
    id: str,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Get a specific notification by ID."""
    return await service.get_notification(id, str(current_user.id))

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    id: str,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Delete a specific notification."""
    await service.delete_notification(id, str(current_user.id))

