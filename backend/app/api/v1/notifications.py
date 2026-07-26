from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.schemas.notification_schema import NotificationCreate, NotificationResponse
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
    """Create a new notification (useful for internal system triggers, exposed here for completeness)."""
    return await service.create_notification(str(current_user.id), notification_in)

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    unread_only: bool = Query(False, description="Filter only unread notifications"),
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """List all notifications for the user."""
    return await service.list_notifications(str(current_user.id), unread_only)

@router.post("/mark-all-read", status_code=status.HTTP_200_OK)
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Mark all unread notifications as read."""
    await service.mark_all_as_read(str(current_user.id))
    return {"status": "success", "message": "All notifications marked as read."}

@router.post("/{id}/mark-read", response_model=NotificationResponse)
async def mark_as_read(
    id: str,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Mark a specific notification as read."""
    return await service.mark_as_read(id, str(current_user.id))

@router.get("/{id}", response_model=NotificationResponse)
async def get_notification(
    id: str,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Get a specific notification."""
    return await service.get_notification(id, str(current_user.id))

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    id: str,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    """Delete a specific notification."""
    await service.delete_notification(id, str(current_user.id))
