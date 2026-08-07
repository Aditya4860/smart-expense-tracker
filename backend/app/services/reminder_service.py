import uuid
from typing import Optional, Sequence, Dict, Any, List
from datetime import date, datetime, timedelta, timezone

from app.models.reminder import Reminder
from app.models.reminder_history import ReminderHistory
from app.models.enums import ReminderType, ReminderFrequency, ReminderStatus, NotificationType
from app.schemas.reminder_schema import (
    ReminderCreate,
    ReminderUpdate,
    ReminderSnooze,
    ReminderProcessResult,
)
from app.schemas.notification_schema import NotificationCreate
from app.repositories.reminder_repository import ReminderRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.notification_repository import NotificationRepository
from app.utils.date_utils import calculate_next_occurrence
from app.core.exceptions import NotFoundException, BadRequestException
from app.core.logging import logger

TYPE_CONFIG = {
    ReminderType.BILL: {"icon": "📄", "prefix": "Bill Due"},
    ReminderType.SUBSCRIPTION: {"icon": "🔁", "prefix": "Subscription Renewal"},
    ReminderType.EMI: {"icon": "💳", "prefix": "EMI Due"},
    ReminderType.SAVINGS: {"icon": "💰", "prefix": "Savings Contribution"},
    ReminderType.BUDGET: {"icon": "📊", "prefix": "Budget Review"},
    ReminderType.GOAL: {"icon": "🎯", "prefix": "Goal Target"},
    ReminderType.CUSTOM: {"icon": "⏰", "prefix": "Reminder"},
}

class ReminderService:
    def __init__(
        self,
        repository: ReminderRepository,
        category_repository: Optional[CategoryRepository] = None,
        notification_repository: Optional[NotificationRepository] = None,
    ):
        self.repository = repository
        self.category_repository = category_repository
        self.notification_repository = notification_repository

    async def create_reminder(
        self, user_id: uuid.UUID, reminder_in: ReminderCreate
    ) -> Reminder:
        if reminder_in.amount is not None and reminder_in.amount <= 0:
            raise BadRequestException("Amount must be greater than 0.")

        if reminder_in.category_id and self.category_repository:
            category = await self.category_repository.get_category(
                str(reminder_in.category_id), str(user_id)
            )
            if not category:
                raise NotFoundException("Category not found.")

        return await self.repository.create_reminder(user_id, reminder_in)

    async def get_reminder(
        self, reminder_id: str, user_id: uuid.UUID
    ) -> Reminder:
        reminder = await self.repository.get_reminder(reminder_id, user_id)
        if not reminder:
            raise NotFoundException("Reminder not found.")
        return reminder

    async def list_reminders(
        self,
        user_id: uuid.UUID,
        type: Optional[str] = None,
        status: Optional[str] = None,
        frequency: Optional[str] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
        search: Optional[str] = None,
        sort: str = "asc",
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Reminder]:
        if skip < 0 or limit <= 0:
            raise BadRequestException("Invalid pagination parameters.")
        limit = min(limit, 500)

        return await self.repository.list_reminders(
            user_id=user_id,
            type=type,
            status=status,
            frequency=frequency,
            from_date=from_date,
            to_date=to_date,
            search=search,
            sort=sort,
            skip=skip,
            limit=limit,
        )

    async def update_reminder(
        self,
        reminder_id: str,
        user_id: uuid.UUID,
        reminder_in: ReminderUpdate,
    ) -> Reminder:
        if reminder_in.amount is not None and reminder_in.amount <= 0:
            raise BadRequestException("Amount must be greater than 0.")

        if reminder_in.category_id and self.category_repository:
            category = await self.category_repository.get_category(
                str(reminder_in.category_id), str(user_id)
            )
            if not category:
                raise NotFoundException("Category not found.")

        updated = await self.repository.update_reminder(
            reminder_id, user_id, reminder_in
        )
        if not updated:
            raise NotFoundException("Reminder not found.")

        await self.repository.add_history(
            reminder_id=updated.id,
            user_id=user_id,
            action="UPDATED",
            notes="Reminder details updated",
        )
        return updated

    async def delete_reminder(
        self, reminder_id: str, user_id: uuid.UUID
    ) -> bool:
        deleted = await self.repository.delete_reminder(reminder_id, user_id)
        if not deleted:
            raise NotFoundException("Reminder not found.")
        return True

    async def complete_reminder(
        self, reminder_id: str, user_id: uuid.UUID
    ) -> Reminder:
        reminder = await self.get_reminder(reminder_id, user_id)

        if reminder.frequency == ReminderFrequency.ONCE:
            update_in = ReminderUpdate(status=ReminderStatus.COMPLETED, snooze_until=None)
            updated = await self.repository.update_reminder(reminder_id, user_id, update_in)
            await self.repository.add_history(
                reminder_id=reminder.id,
                user_id=user_id,
                action="COMPLETED",
                notes=f"Reminder marked as completed for {reminder.due_date.isoformat()}",
            )
            return updated
        else:
            # Recurring reminder: complete current instance and advance to next due date
            next_date = calculate_next_occurrence(reminder.due_date, reminder.frequency)
            update_in = ReminderUpdate(
                due_date=next_date,
                status=ReminderStatus.PENDING,
                snooze_until=None,
            )
            updated = await self.repository.update_reminder(reminder_id, user_id, update_in)
            await self.repository.add_history(
                reminder_id=reminder.id,
                user_id=user_id,
                action="COMPLETED",
                notes=f"Completed occurrence for {reminder.due_date.isoformat()}",
            )
            await self.repository.add_history(
                reminder_id=reminder.id,
                user_id=user_id,
                action="ADVANCED",
                notes=f"Advanced to next scheduled occurrence: {next_date.isoformat()}",
            )
            return updated

    async def snooze_reminder(
        self, reminder_id: str, user_id: uuid.UUID, snooze_in: ReminderSnooze
    ) -> Reminder:
        reminder = await self.get_reminder(reminder_id, user_id)
        today = date.today()
        base_date = max(reminder.due_date, today)
        snooze_target = snooze_in.snooze_until or (base_date + timedelta(days=snooze_in.days))

        update_in = ReminderUpdate(
            status=ReminderStatus.SNOOZED,
            snooze_until=snooze_target,
        )
        updated = await self.repository.update_reminder(reminder_id, user_id, update_in)
        await self.repository.add_history(
            reminder_id=reminder.id,
            user_id=user_id,
            action="SNOOZED",
            notes=f"Snoozed until {snooze_target.isoformat()}",
        )
        return updated

    async def dismiss_reminder(
        self, reminder_id: str, user_id: uuid.UUID
    ) -> Reminder:
        reminder = await self.get_reminder(reminder_id, user_id)
        update_in = ReminderUpdate(status=ReminderStatus.DISMISSED, snooze_until=None)
        updated = await self.repository.update_reminder(reminder_id, user_id, update_in)
        await self.repository.add_history(
            reminder_id=reminder.id,
            user_id=user_id,
            action="DISMISSED",
            notes="Reminder dismissed",
        )
        return updated

    async def process_due_reminders(
        self, user_id: uuid.UUID, target_date: Optional[date] = None
    ) -> ReminderProcessResult:
        """Finds all due reminders, creates in-app notifications, and updates notification timestamps."""
        effective_date = target_date or date.today()
        due_items = await self.repository.get_due_reminders(user_id, effective_date)

        processed = []
        messages = []

        for item in due_items:
            try:
                # Trigger in-app notification if auto-notified
                if item.is_auto_notified and self.notification_repository:
                    type_info = TYPE_CONFIG.get(item.type, {"icon": "⏰", "prefix": "Reminder"})
                    amount_str = f" of ₹{float(item.amount):,.2f}" if item.amount else ""
                    time_str = f" at {item.due_time}" if item.due_time else ""
                    
                    title = f"{type_info['icon']} {type_info['prefix']}: {item.title}"
                    message = (
                        f"{item.title}{amount_str} is due on {item.due_date.strftime('%b %d, %Y')}{time_str}."
                        + (f" ({item.description})" if item.description else "")
                    )

                    await self.notification_repository.create_notification(
                        str(user_id),
                        NotificationCreate(
                            title=title,
                            message=message,
                            type=NotificationType.REMINDER,
                            data={
                                "reminder_id": str(item.id),
                                "reminder_type": item.type.value,
                                "due_date": item.due_date.isoformat(),
                                "amount": float(item.amount) if item.amount else None,
                            },
                        ),
                    )

                # Update reminder state
                item.last_notified_at = datetime.now(timezone.utc)
                await self.repository.db.commit()


                await self.repository.add_history(
                    reminder_id=item.id,
                    user_id=user_id,
                    action="NOTIFIED",
                    notes=f"Due notification triggered for {item.due_date.isoformat()}",
                )

                processed.append({
                    "id": str(item.id),
                    "title": item.title,
                    "type": item.type.value,
                    "due_date": item.due_date.isoformat(),
                    "amount": float(item.amount) if item.amount else None,
                })
                messages.append(f"Notified for reminder '{item.title}'.")
            except Exception as e:
                logger.error(f"Failed to process due reminder {item.id}: {e}")
                messages.append(f"Error notifying for reminder {item.id}: {str(e)}")

        return ReminderProcessResult(
            notified_count=len(processed),
            processed_reminders=processed,
            messages=messages,
        )

    async def list_history(
        self,
        user_id: uuid.UUID,
        reminder_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[ReminderHistory]:
        return await self.repository.list_history(
            user_id=user_id, reminder_id=reminder_id, skip=skip, limit=limit
        )

    async def get_counts(self, user_id: uuid.UUID) -> Dict[str, int]:
        return await self.repository.get_counts(user_id)
