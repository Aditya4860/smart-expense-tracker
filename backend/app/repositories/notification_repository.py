from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, update
from app.models.notification import Notification
from app.schemas.notification_schema import NotificationCreate
from app.core.logging import logger

class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(self, user_id: str, notification_in: NotificationCreate) -> Notification:
        try:
            db_notification = Notification(
                user_id=user_id,
                title=notification_in.title,
                message=notification_in.message,
                is_read=notification_in.is_read
            )
            self.db.add(db_notification)
            await self.db.commit()
            await self.db.refresh(db_notification)
            return db_notification
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating notification: {e}")
            raise

    async def get_notification(self, notification_id: str, user_id: str) -> Optional[Notification]:
        result = await self.db.execute(
            select(Notification).where(and_(Notification.id == notification_id, Notification.user_id == user_id))
        )
        return result.scalars().first()

    async def list_notifications(self, user_id: str, unread_only: bool = False, skip: int = 0, limit: int = 100) -> Sequence[Notification]:
        query = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
        
        if unread_only:
            query = query.where(Notification.is_read == False)
            
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def mark_as_read(self, notification_id: str, user_id: str) -> Optional[Notification]:
        try:
            db_notification = await self.get_notification(notification_id, user_id)
            if not db_notification:
                return None
                
            db_notification.is_read = True
            await self.db.commit()
            await self.db.refresh(db_notification)
            return db_notification
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error marking notification as read {notification_id}: {e}")
            raise

    async def mark_all_as_read(self, user_id: str) -> bool:
        try:
            await self.db.execute(
                update(Notification)
                .where(and_(Notification.user_id == user_id, Notification.is_read == False))
                .values(is_read=True)
            )
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error marking all notifications as read: {e}")
            raise

    async def delete_notification(self, notification_id: str, user_id: str) -> bool:
        try:
            db_notification = await self.get_notification(notification_id, user_id)
            if not db_notification:
                return False
                
            await self.db.delete(db_notification)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting notification {notification_id}: {e}")
            raise
