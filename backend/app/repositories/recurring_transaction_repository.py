import uuid
from typing import Optional, Sequence, Dict
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, func
from sqlalchemy.orm import selectinload
from app.models.recurring_transaction import RecurringTransaction
from app.models.enums import RecurringStatus
from app.schemas.recurring_transaction_schema import RecurringTransactionCreate, RecurringTransactionUpdate
from app.core.logging import logger

class RecurringTransactionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_recurring_transaction(
        self, user_id: uuid.UUID, recurring_in: RecurringTransactionCreate
    ) -> RecurringTransaction:
        try:
            next_date = recurring_in.next_date or recurring_in.start_date

            db_recurring = RecurringTransaction(
                user_id=user_id,
                type=recurring_in.type,
                amount=recurring_in.amount,
                frequency=recurring_in.frequency,
                category_id=recurring_in.category_id,
                title=recurring_in.title,
                description=recurring_in.description,
                merchant=recurring_in.merchant,
                payment_method=recurring_in.payment_method,
                start_date=recurring_in.start_date,
                end_date=recurring_in.end_date,
                is_never_ending=recurring_in.is_never_ending,
                next_date=next_date,
                status=RecurringStatus.ACTIVE,
                auto_process=recurring_in.auto_process,
            )
            self.db.add(db_recurring)
            await self.db.commit()
            return await self.get_recurring_transaction(str(db_recurring.id), user_id)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating recurring transaction: {e}")
            raise

    async def get_recurring_transaction(
        self, recurring_id: str, user_id: uuid.UUID
    ) -> Optional[RecurringTransaction]:
        result = await self.db.execute(
            select(RecurringTransaction)
            .options(selectinload(RecurringTransaction.category))
            .where(
                and_(
                    RecurringTransaction.id == recurring_id,
                    RecurringTransaction.user_id == user_id,
                )
            )
        )
        recurring = result.scalars().first()
        if recurring and recurring.category:
            recurring.category_name = recurring.category.name
        return recurring

    async def list_recurring_transactions(
        self,
        user_id: uuid.UUID,
        type: Optional[str] = None,
        status: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None,
        sort: str = "asc",
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[RecurringTransaction]:
        query = (
            select(RecurringTransaction)
            .options(selectinload(RecurringTransaction.category))
            .where(RecurringTransaction.user_id == user_id)
        )

        if type:
            query = query.where(RecurringTransaction.type == type)
        if status:
            query = query.where(RecurringTransaction.status == status)
        if category_id:
            query = query.where(RecurringTransaction.category_id == category_id)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    RecurringTransaction.title.ilike(search_pattern),
                    RecurringTransaction.description.ilike(search_pattern),
                    RecurringTransaction.merchant.ilike(search_pattern),
                )
            )

        if sort == "desc":
            query = query.order_by(RecurringTransaction.next_date.desc(), RecurringTransaction.created_at.desc())
        else:
            query = query.order_by(RecurringTransaction.next_date.asc(), RecurringTransaction.created_at.asc())

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        items = result.scalars().all()

        for item in items:
            if item.category:
                item.category_name = item.category.name
        return items

    async def update_recurring_transaction(
        self,
        recurring_id: str,
        user_id: uuid.UUID,
        recurring_in: RecurringTransactionUpdate,
    ) -> Optional[RecurringTransaction]:
        recurring = await self.get_recurring_transaction(recurring_id, user_id)
        if not recurring:
            return None

        update_data = recurring_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(recurring, key, value)

        try:
            await self.db.commit()
            return await self.get_recurring_transaction(recurring_id, user_id)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating recurring transaction: {e}")
            raise

    async def delete_recurring_transaction(
        self, recurring_id: str, user_id: uuid.UUID
    ) -> bool:
        recurring = await self.get_recurring_transaction(recurring_id, user_id)
        if not recurring:
            return False

        try:
            await self.db.delete(recurring)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting recurring transaction: {e}")
            raise

    async def get_due_recurring_transactions(
        self, user_id: uuid.UUID, target_date: date
    ) -> Sequence[RecurringTransaction]:
        """Fetch all active recurring transactions that are due on or before target_date."""
        result = await self.db.execute(
            select(RecurringTransaction)
            .options(selectinload(RecurringTransaction.category))
            .where(
                and_(
                    RecurringTransaction.user_id == user_id,
                    RecurringTransaction.status == RecurringStatus.ACTIVE,
                    RecurringTransaction.next_date <= target_date,
                )
            )
            .order_by(RecurringTransaction.next_date.asc())
        )
        items = result.scalars().all()
        for item in items:
            if item.category:
                item.category_name = item.category.name
        return items

    async def get_counts(self, user_id: uuid.UUID) -> Dict[str, int]:
        """Fetch counts of recurring transactions by status."""
        active_res = await self.db.execute(
            select(func.count(RecurringTransaction.id)).where(
                and_(
                    RecurringTransaction.user_id == user_id,
                    RecurringTransaction.status == RecurringStatus.ACTIVE,
                )
            )
        )
        paused_res = await self.db.execute(
            select(func.count(RecurringTransaction.id)).where(
                and_(
                    RecurringTransaction.user_id == user_id,
                    RecurringTransaction.status == RecurringStatus.PAUSED,
                )
            )
        )
        total_res = await self.db.execute(
            select(func.count(RecurringTransaction.id)).where(
                RecurringTransaction.user_id == user_id
            )
        )

        return {
            "active_count": active_res.scalar() or 0,
            "paused_count": paused_res.scalar() or 0,
            "total_count": total_res.scalar() or 0,
        }
