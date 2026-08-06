import uuid
from typing import Optional, Sequence
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, func, extract
from sqlalchemy.orm import selectinload
from app.models.expense import Expense
from app.schemas.expense_schema import ExpenseCreate, ExpenseUpdate
from app.core.logging import logger

class ExpenseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_expense(self, user_id: uuid.UUID, expense_in: ExpenseCreate) -> Expense:
        try:
            db_expense = Expense(
                user_id=user_id,
                merchant=expense_in.merchant,
                description=expense_in.description,
                amount=expense_in.amount,
                category_id=expense_in.category_id,
                payment_method=expense_in.payment_method,
                date=expense_in.date,
                receipt_url=str(expense_in.receipt_url) if expense_in.receipt_url else None
            )
            self.db.add(db_expense)
            await self.db.commit()
            
            # Fetch with category eagerly loaded
            return await self.get_expense(str(db_expense.id), user_id)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating expense: {e}")
            raise

    async def get_expense(self, expense_id: str, user_id: uuid.UUID) -> Optional[Expense]:
        result = await self.db.execute(
            select(Expense)
            .options(selectinload(Expense.category))
            .where(and_(Expense.id == expense_id, Expense.user_id == user_id))
        )
        expense = result.scalars().first()
        if expense and expense.category:
            expense.category_name = expense.category.name
        return expense

    async def list_expenses(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[uuid.UUID] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        search_query: Optional[str] = None
    ) -> Sequence[Expense]:
        filters = [Expense.user_id == user_id]

        if category_id:
            filters.append(Expense.category_id == category_id)
        if start_date:
            filters.append(Expense.date >= start_date)
        if end_date:
            filters.append(Expense.date <= end_date)
        if min_amount is not None:
            filters.append(Expense.amount >= min_amount)
        if max_amount is not None:
            filters.append(Expense.amount <= max_amount)
        if search_query and search_query.strip():
            from app.core.sanitization import escape_like_pattern
            clean_term = escape_like_pattern(search_query)
            term = f"%{clean_term}%"
            filters.append(or_(Expense.merchant.ilike(term), Expense.description.ilike(term)))

        query = (
            select(Expense)
            .options(selectinload(Expense.category))
            .where(and_(*filters))
            .order_by(Expense.date.desc(), Expense.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await self.db.execute(query)
        expenses = result.scalars().all()
        for expense in expenses:
            if expense.category:
                expense.category_name = expense.category.name
        return expenses

    async def update_expense(self, expense_id: str, user_id: uuid.UUID, expense_in: ExpenseUpdate) -> Optional[Expense]:
        try:
            db_expense = await self.get_expense(expense_id, user_id)
            if not db_expense:
                return None
                
            update_data = expense_in.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                if field == 'receipt_url' and value is not None:
                    setattr(db_expense, field, str(value))
                else:
                    setattr(db_expense, field, value)
                    
            await self.db.commit()
            return await self.get_expense(expense_id, user_id)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating expense {expense_id}: {e}")
            raise

    async def delete_expense(self, expense_id: str, user_id: uuid.UUID) -> bool:
        try:
            db_expense = await self.get_expense(expense_id, user_id)
            if not db_expense:
                return False
                
            await self.db.delete(db_expense)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting expense {expense_id}: {e}")
            raise

    async def search_expenses(self, user_id: uuid.UUID, query: str, skip: int = 0, limit: int = 100) -> Sequence[Expense]:
        return await self.list_expenses(user_id=user_id, skip=skip, limit=limit, search_query=query)

    async def filter_by_category(self, user_id: uuid.UUID, category_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Sequence[Expense]:
        return await self.list_expenses(user_id=user_id, skip=skip, limit=limit, category_id=category_id)

    async def filter_by_date(self, user_id: uuid.UUID, start_date: date, end_date: date, skip: int = 0, limit: int = 100) -> Sequence[Expense]:
        return await self.list_expenses(user_id=user_id, skip=skip, limit=limit, start_date=start_date, end_date=end_date)

    async def filter_by_amount(self, user_id: uuid.UUID, min_amount: float, max_amount: float, skip: int = 0, limit: int = 100) -> Sequence[Expense]:
        return await self.list_expenses(user_id=user_id, skip=skip, limit=limit, min_amount=min_amount, max_amount=max_amount)

    async def get_monthly_summary(self, user_id: uuid.UUID, year: int, month: int) -> float:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(
                and_(
                    Expense.user_id == user_id,
                    extract('year', Expense.date) == year,
                    extract('month', Expense.date) == month
                )
            )
        )
        return float(result.scalar() or 0.0)

    async def get_statistics(self, user_id: uuid.UUID, start_date: date, end_date: date) -> dict:
        result = await self.db.execute(
            select(
                func.count(Expense.id).label('total_transactions'),
                func.coalesce(func.sum(Expense.amount), 0).label('total_amount'),
                func.coalesce(func.avg(Expense.amount), 0).label('average_amount'),
                func.coalesce(func.max(Expense.amount), 0).label('max_amount'),
                func.coalesce(func.min(Expense.amount), 0).label('min_amount')
            ).where(
                and_(
                    Expense.user_id == user_id,
                    Expense.date >= start_date,
                    Expense.date <= end_date
                )
            )
        )
        row = result.first()
        if row and row.total_transactions > 0:
            return {
                "total_transactions": row.total_transactions,
                "total_amount": float(row.total_amount),
                "average_amount": float(row.average_amount),
                "max_amount": float(row.max_amount),
                "min_amount": float(row.min_amount)
            }
        return {
            "total_transactions": 0,
            "total_amount": 0.0,
            "average_amount": 0.0,
            "max_amount": 0.0,
            "min_amount": 0.0
        }
