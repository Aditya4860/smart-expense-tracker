from typing import Sequence, Optional, Dict, Any
from app.models.notification import Notification
from app.models.enums import NotificationType
from app.schemas.notification_schema import NotificationCreate
from app.repositories.notification_repository import NotificationRepository
from app.core.exceptions import BadRequestException, NotFoundException

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

    async def list_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        notification_type: Optional[str] = None,
        sort: str = "desc",
        skip: int = 0,
        limit: int = 100
    ) -> Sequence[Notification]:
        if skip < 0 or limit <= 0:
            raise BadRequestException("Invalid pagination parameters.")
        limit = min(limit, 500)
        return await self.repository.list_notifications(
            user_id=user_id,
            unread_only=unread_only,
            notification_type=notification_type,
            sort=sort,
            skip=skip,
            limit=limit
        )

    async def get_counts(self, user_id: str) -> Dict[str, int]:
        return await self.repository.get_counts(user_id)

    async def mark_as_read(self, notification_id: str, user_id: str) -> Notification:
        notification = await self.repository.mark_as_read(notification_id, user_id)
        if not notification:
            raise NotFoundException("Notification not found")
        return notification

    async def mark_as_unread(self, notification_id: str, user_id: str) -> Notification:
        notification = await self.repository.mark_as_unread(notification_id, user_id)
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

    async def clear_all_read(self, user_id: str) -> int:
        return await self.repository.clear_all_read(user_id)

    async def seed_sample_notifications(self, user_id: str) -> Sequence[Notification]:
        """Seeds realistic sample notifications representing each system trigger."""
        samples = [
            NotificationCreate(
                title="🚨 Budget Exceeded: Food & Dining",
                message="You've spent ₹16,450 of your ₹15,000 monthly budget for Food & Dining (109%).",
                type=NotificationType.BUDGET_EXCEEDED,
                data={"category": "Food & Dining", "spent": 16450, "limit": 15000, "percent": 109.6}
            ),
            NotificationCreate(
                title="⚠️ Budget Warning: Shopping & Retail",
                message="You have used 85% (₹8,500 / ₹10,000) of your Shopping budget for this month.",
                type=NotificationType.BUDGET_WARNING,
                data={"category": "Shopping & Retail", "spent": 8500, "limit": 10000, "percent": 85.0}
            ),
            NotificationCreate(
                title="🏆 Goal Achieved: Emergency Fund",
                message="Congratulations! You have reached 100% of your ₹3,00,000 target for Emergency Fund.",
                type=NotificationType.GOAL_ACHIEVED,
                data={"goalTitle": "Emergency Fund", "target": 300000, "current": 300000}
            ),
            NotificationCreate(
                title="🎯 Milestone Reached: Dream Vacation",
                message="You've completed 75% of your Dream Vacation goal! Keep up the momentum.",
                type=NotificationType.GOAL_MILESTONE,
                data={"goalTitle": "Dream Vacation", "percent": 75}
            ),
            NotificationCreate(
                title="💸 Large Expense Alert: Electronics",
                message="A high-value transaction of ₹45,999 was recorded under Shopping.",
                type=NotificationType.LARGE_EXPENSE,
                data={"amount": 45999, "category": "Shopping"}
            ),
            NotificationCreate(
                title="📈 Large Income Received: Quarterly Bonus",
                message="An income transaction of ₹75,000 was credited to Salary & Wages.",
                type=NotificationType.LARGE_INCOME,
                data={"amount": 75000, "category": "Salary & Wages"}
            ),
            NotificationCreate(
                title="🔄 Recurring Transaction Executed: WiFi Broadband",
                message="Recurring payment of ₹1,199 for Broadband Internet was recorded successfully.",
                type=NotificationType.RECURRING_EXECUTED,
                data={"amount": 1199, "title": "WiFi Broadband"}
            ),
            NotificationCreate(
                title="📊 Monthly Financial Summary Available",
                message="Your analytics and spending report for last month is ready for review.",
                type=NotificationType.MONTHLY_SUMMARY,
                data={"month": "Current", "savingsRate": 28.5}
            ),
        ]

        for s in samples:
            await self.repository.create_notification(user_id, s)

        return await self.list_notifications(user_id=user_id, limit=20)

