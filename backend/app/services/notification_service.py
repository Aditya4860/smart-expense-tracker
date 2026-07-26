from typing import Sequence
from app.models.notification import Notification
from app.schemas.notification_schema import NotificationCreate
from app.repositories.notification_repository import NotificationRepository
from app.core.exceptions import NotFoundException

class NotificationService:
    def __init__(self, repository: NotificationRepository):
        self.repository = repository

    async def create_notification(self, user_id: str, notification_in: NotificationCreate) -> Notification:
        return await self.repository.create_notification(user_id, notification_in)

    async def get_notification(self, notification_id: str, user_id: str) -> Notification:
        notification = await self.repository.get_notification(notification_id, user_id)
        if not notification:
            raise NotFoundException("Notification not found")
        return notification

    async def list_notifications(self, user_id: str, unread_only: bool = False) -> Sequence[Notification]:
        return await self.repository.list_notifications(user_id, unread_only)

    async def mark_as_read(self, notification_id: str, user_id: str) -> Notification:
        notification = await self.repository.mark_as_read(notification_id, user_id)
        if not notification:
            raise NotFoundException("Notification not found")
        return notification

    async def mark_all_as_read(self, user_id: str) -> bool:
        return await self.repository.mark_all_as_read(user_id)

    async def delete_notification(self, notification_id: str, user_id: str) -> bool:
        success = await self.repository.delete_notification(notification_id, user_id)
        if not success:
            raise NotFoundException("Notification not found")
        return success
