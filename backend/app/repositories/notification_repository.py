from typing import Optional, Sequence, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, update, delete, func
from app.models.notification import Notification
from app.models.enums import NotificationType
from app.schemas.notification_schema import NotificationCreate
from app.core.logging import logger

class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(self, user_id: str, notification_in: NotificationCreate) -> Notification:
        try:
            notification_type = (
                notification_in.type.value if hasattr(notification_in.type, 'value') 
                else str(notification_in.type or NotificationType.SYSTEM.value)
            )
            db_notification = Notification(
                user_id=user_id,
                title=notification_in.title,
                message=notification_in.message,
                type=notification_type,
                is_read=notification_in.is_read,
                data=notification_in.data
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

    async def list_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        notification_type: Optional[str] = None,
        sort: str = "desc",
        skip: int = 0,
        limit: int = 100
    ) -> Sequence[Notification]:
        query = select(Notification).where(Notification.user_id == user_id)
        
        if unread_only:
            query = query.where(Notification.is_read == False)
            
        if notification_type:
            query = query.where(Notification.type == notification_type)

        if sort.lower() == "asc":
            query = query.order_by(Notification.created_at.asc())
        else:
            query = query.order_by(Notification.created_at.desc())
            
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_counts(self, user_id: str) -> Dict[str, int]:
        total_res = await self.db.execute(
            select(func.count(Notification.id)).where(Notification.user_id == user_id)
        )
        total_count = total_res.scalar() or 0

        unread_res = await self.db.execute(
            select(func.count(Notification.id)).where(
                and_(Notification.user_id == user_id, Notification.is_read == False)
            )
        )
        unread_count = unread_res.scalar() or 0

        return {
            "unread_count": unread_count,
            "total_count": total_count
        }

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

    async def mark_as_unread(self, notification_id: str, user_id: str) -> Optional[Notification]:
        try:
            db_notification = await self.get_notification(notification_id, user_id)
            if not db_notification:
                return None
                
            db_notification.is_read = False
            await self.db.commit()
            await self.db.refresh(db_notification)
            return db_notification
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error marking notification as unread {notification_id}: {e}")
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

    async def clear_all_read(self, user_id: str) -> int:
        try:
            res = await self.db.execute(
                delete(Notification)
                .where(and_(Notification.user_id == user_id, Notification.is_read == True))
            )
            await self.db.commit()
            return res.rowcount or 0
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error clearing read notifications for {user_id}: {e}")
            raise

