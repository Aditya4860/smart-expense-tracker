import uuid
from typing import Optional, Sequence
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func, extract
from sqlalchemy.orm import selectinload
from app.models.expense import Expense
from app.schemas.expense_schema import ExpenseCreate, ExpenseUpdate

class ExpenseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_expense(self, user_id: uuid.UUID, expense_in: ExpenseCreate) -> Expense:
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
        await self.db.refresh(db_expense)
        return db_expense

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

    async def list_expenses(self, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Sequence[Expense]:
        result = await self.db.execute(
            select(Expense)
            .options(selectinload(Expense.category))
            .where(Expense.user_id == user_id)
            .order_by(Expense.date.desc())
            .offset(skip)
            .limit(limit)
        )
        expenses = result.scalars().all()
        for expense in expenses:
            if expense.category:
                expense.category_name = expense.category.name
        return expenses

    async def update_expense(self, expense_id: str, user_id: uuid.UUID, expense_in: ExpenseUpdate) -> Optional[Expense]:
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
        await self.db.refresh(db_expense)
        if db_expense.category:
            db_expense.category_name = db_expense.category.name
        return db_expense

    async def delete_expense(self, expense_id: str, user_id: uuid.UUID) -> bool:
        db_expense = await self.get_expense(expense_id, user_id)
        if not db_expense:
            return False
            
        await self.db.delete(db_expense)
        await self.db.commit()
        return True

    async def search_expenses(self, user_id: uuid.UUID, query: str) -> Sequence[Expense]:
        result = await self.db.execute(
            select(Expense)
            .options(selectinload(Expense.category))
            .where(
                and_(
                    Expense.user_id == user_id,
                    Expense.merchant.ilike(f"%{query}%")
                )
            ).order_by(Expense.date.desc())
        )
        expenses = result.scalars().all()
        for expense in expenses:
            if expense.category:
                expense.category_name = expense.category.name
        return expenses

    async def filter_by_category(self, user_id: uuid.UUID, category_id: uuid.UUID) -> Sequence[Expense]:
        result = await self.db.execute(
            select(Expense)
            .options(selectinload(Expense.category))
            .where(
                and_(
                    Expense.user_id == user_id,
                    Expense.category_id == category_id
                )
            ).order_by(Expense.date.desc())
        )
        expenses = result.scalars().all()
        for expense in expenses:
            if expense.category:
                expense.category_name = expense.category.name
        return expenses

    async def filter_by_date(self, user_id: uuid.UUID, start_date: date, end_date: date) -> Sequence[Expense]:
        result = await self.db.execute(
            select(Expense)
            .options(selectinload(Expense.category))
            .where(
                and_(
                    Expense.user_id == user_id,
                    Expense.date >= start_date,
                    Expense.date <= end_date
                )
            ).order_by(Expense.date.desc())
        )
        expenses = result.scalars().all()
        for expense in expenses:
            if expense.category:
                expense.category_name = expense.category.name
        return expenses

    async def filter_by_amount(self, user_id: uuid.UUID, min_amount: float, max_amount: float) -> Sequence[Expense]:
        result = await self.db.execute(
            select(Expense)
            .options(selectinload(Expense.category))
            .where(
                and_(
                    Expense.user_id == user_id,
                    Expense.amount >= min_amount,
                    Expense.amount <= max_amount
                )
            ).order_by(Expense.amount.desc())
        )
        expenses = result.scalars().all()
        for expense in expenses:
            if expense.category:
                expense.category_name = expense.category.name
        return expenses

    async def get_monthly_summary(self, user_id: uuid.UUID, year: int, month: int) -> float:
        result = await self.db.execute(
            select(func.sum(Expense.amount)).where(
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
                func.sum(Expense.amount).label('total_amount'),
                func.avg(Expense.amount).label('average_amount'),
                func.max(Expense.amount).label('max_amount'),
                func.min(Expense.amount).label('min_amount')
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
