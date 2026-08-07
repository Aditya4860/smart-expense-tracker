import uuid
from typing import Optional, Sequence, Dict, List
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, func
from sqlalchemy.orm import selectinload

from app.models.reminder import Reminder
from app.models.reminder_history import ReminderHistory
from app.models.enums import ReminderStatus, ReminderFrequency
from app.schemas.reminder_schema import ReminderCreate, ReminderUpdate
from app.core.logging import logger

class ReminderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_reminder(
        self, user_id: uuid.UUID, reminder_in: ReminderCreate
    ) -> Reminder:
        try:
            db_reminder = Reminder(
                user_id=user_id,
                title=reminder_in.title,
                description=reminder_in.description,
                amount=reminder_in.amount,
                type=reminder_in.type,
                frequency=reminder_in.frequency,
                due_date=reminder_in.due_date,
                due_time=reminder_in.due_time,
                category_id=reminder_in.category_id,
                is_auto_notified=reminder_in.is_auto_notified,
                status=ReminderStatus.PENDING,
            )
            self.db.add(db_reminder)
            await self.db.commit()

            # Record history
            await self.add_history(
                reminder_id=db_reminder.id,
                user_id=user_id,
                action="CREATED",
                notes=f"Reminder created for {reminder_in.due_date.isoformat()}",
            )

            return await self.get_reminder(str(db_reminder.id), user_id)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating reminder: {e}")
            raise

    async def get_reminder(
        self, reminder_id: str, user_id: uuid.UUID
    ) -> Optional[Reminder]:
        result = await self.db.execute(
            select(Reminder)
            .options(
                selectinload(Reminder.category),
                selectinload(Reminder.history),
            )
            .where(
                and_(
                    Reminder.id == reminder_id,
                    Reminder.user_id == user_id,
                )
            )
        )
        reminder = result.scalars().first()
        if reminder:
            if reminder.category:
                reminder.category_name = reminder.category.name
            reminder.is_overdue = (
                reminder.status in [ReminderStatus.PENDING, ReminderStatus.SNOOZED]
                and (reminder.snooze_until or reminder.due_date) < date.today()
            )
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
        query = (
            select(Reminder)
            .options(
                selectinload(Reminder.category),
                selectinload(Reminder.history),
            )
            .where(Reminder.user_id == user_id)
        )

        if type:
            query = query.where(Reminder.type == type)
        if status:
            query = query.where(Reminder.status == status)
        if frequency:
            query = query.where(Reminder.frequency == frequency)
        if from_date:
            query = query.where(Reminder.due_date >= from_date)
        if to_date:
            query = query.where(Reminder.due_date <= to_date)
        if search:
            search_pat = f"%{search}%"
            query = query.where(
                or_(
                    Reminder.title.ilike(search_pat),
                    Reminder.description.ilike(search_pat),
                )
            )

        if sort == "desc":
            query = query.order_by(Reminder.due_date.desc(), Reminder.created_at.desc())
        else:
            query = query.order_by(Reminder.due_date.asc(), Reminder.created_at.asc())

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        items = result.scalars().all()

        today = date.today()
        for item in items:
            if item.category:
                item.category_name = item.category.name
            effective_date = item.snooze_until if (item.status == ReminderStatus.SNOOZED and item.snooze_until) else item.due_date
            item.is_overdue = (
                item.status in [ReminderStatus.PENDING, ReminderStatus.SNOOZED]
                and effective_date < today
            )
        return items

    async def update_reminder(
        self,
        reminder_id: str,
        user_id: uuid.UUID,
        reminder_in: ReminderUpdate,
    ) -> Optional[Reminder]:
        reminder = await self.get_reminder(reminder_id, user_id)
        if not reminder:
            return None

        update_data = reminder_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(reminder, key, value)

        try:
            await self.db.commit()
            return await self.get_reminder(reminder_id, user_id)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating reminder: {e}")
            raise

    async def delete_reminder(
        self, reminder_id: str, user_id: uuid.UUID
    ) -> bool:
        reminder = await self.get_reminder(reminder_id, user_id)
        if not reminder:
            return False

        try:
            await self.db.delete(reminder)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting reminder: {e}")
            raise

    async def get_due_reminders(
        self, user_id: uuid.UUID, target_date: date
    ) -> Sequence[Reminder]:
        """Fetch reminders that are pending or snoozed and due on or before target_date."""
        result = await self.db.execute(
            select(Reminder)
            .options(selectinload(Reminder.category))
            .where(
                and_(
                    Reminder.user_id == user_id,
                    Reminder.status.in_([ReminderStatus.PENDING, ReminderStatus.SNOOZED]),
                    or_(
                        and_(Reminder.status == ReminderStatus.PENDING, Reminder.due_date <= target_date),
                        and_(Reminder.status == ReminderStatus.SNOOZED, Reminder.snooze_until <= target_date),
                    ),
                )
            )
            .order_by(Reminder.due_date.asc())
        )
        items = result.scalars().all()
        for item in items:
            if item.category:
                item.category_name = item.category.name
        return items

    async def add_history(
        self,
        reminder_id: uuid.UUID,
        user_id: uuid.UUID,
        action: str,
        notes: Optional[str] = None,
        action_date: Optional[date] = None,
    ) -> ReminderHistory:
        try:
            history = ReminderHistory(
                reminder_id=reminder_id,
                user_id=user_id,
                action=action,
                notes=notes,
                action_date=action_date or date.today(),
            )
            self.db.add(history)
            await self.db.commit()
            return history
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error recording reminder history: {e}")
            raise

    async def list_history(
        self,
        user_id: uuid.UUID,
        reminder_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[ReminderHistory]:
        query = (
            select(ReminderHistory)
            .where(ReminderHistory.user_id == user_id)
        )
        if reminder_id:
            query = query.where(ReminderHistory.reminder_id == reminder_id)

        query = query.order_by(ReminderHistory.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_counts(self, user_id: uuid.UUID) -> Dict[str, int]:
        today = date.today()

        pending_res = await self.db.execute(
            select(func.count(Reminder.id)).where(
                and_(
                    Reminder.user_id == user_id,
                    Reminder.status.in_([ReminderStatus.PENDING, ReminderStatus.SNOOZED]),
                )
            )
        )
        overdue_res = await self.db.execute(
            select(func.count(Reminder.id)).where(
                and_(
                    Reminder.user_id == user_id,
                    Reminder.status.in_([ReminderStatus.PENDING, ReminderStatus.SNOOZED]),
                    or_(
                        and_(Reminder.status == ReminderStatus.PENDING, Reminder.due_date < today),
                        and_(Reminder.status == ReminderStatus.SNOOZED, Reminder.snooze_until < today),
                    ),
                )
            )
        )
        completed_res = await self.db.execute(
            select(func.count(Reminder.id)).where(
                and_(
                    Reminder.user_id == user_id,
                    Reminder.status == ReminderStatus.COMPLETED,
                )
            )
        )
        total_res = await self.db.execute(
            select(func.count(Reminder.id)).where(Reminder.user_id == user_id)
        )

        return {
            "pending_count": pending_res.scalar() or 0,
            "overdue_count": overdue_res.scalar() or 0,
            "completed_count": completed_res.scalar() or 0,
            "total_count": total_res.scalar() or 0,
        }
