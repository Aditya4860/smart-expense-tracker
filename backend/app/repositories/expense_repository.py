from typing import Optional, Sequence
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.models.expense import Expense
from app.schemas.expense_schema import ExpenseCreate, ExpenseUpdate

class ExpenseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_expense(self, user_id: str, expense_in: ExpenseCreate) -> Expense:
        db_expense = Expense(
            user_id=user_id,
            title=expense_in.title,
            description=expense_in.description,
            amount=expense_in.amount,
            category=expense_in.category,
            payment_method=expense_in.payment_method,
            transaction_date=expense_in.transaction_date,
            notes=expense_in.notes,
            receipt_url=str(expense_in.receipt_url) if expense_in.receipt_url else None
        )
        self.db.add(db_expense)
        await self.db.commit()
        await self.db.refresh(db_expense)
        return db_expense

    async def get_expense(self, expense_id: str, user_id: str) -> Optional[Expense]:
        result = await self.db.execute(
            select(Expense).where(and_(Expense.id == expense_id, Expense.user_id == user_id))
        )
        return result.scalars().first()

    async def list_expenses(self, user_id: str, skip: int = 0, limit: int = 100) -> Sequence[Expense]:
        result = await self.db.execute(
            select(Expense)
            .where(Expense.user_id == user_id)
            .order_by(Expense.transaction_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def update_expense(self, expense_id: str, user_id: str, expense_in: ExpenseUpdate) -> Optional[Expense]:
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
        return db_expense

    async def delete_expense(self, expense_id: str, user_id: str) -> bool:
        db_expense = await self.get_expense(expense_id, user_id)
        if not db_expense:
            return False
            
        await self.db.delete(db_expense)
        await self.db.commit()
        return True

    async def search_expenses(self, user_id: str, query: str) -> Sequence[Expense]:
        result = await self.db.execute(
            select(Expense).where(
                and_(
                    Expense.user_id == user_id,
                    Expense.title.ilike(f"%{query}%")
                )
            ).order_by(Expense.transaction_date.desc())
        )
        return result.scalars().all()

    async def filter_by_category(self, user_id: str, category: str) -> Sequence[Expense]:
        result = await self.db.execute(
            select(Expense).where(
                and_(
                    Expense.user_id == user_id,
                    Expense.category == category
                )
            ).order_by(Expense.transaction_date.desc())
        )
        return result.scalars().all()

    async def filter_by_date(self, user_id: str, start_date: date, end_date: date) -> Sequence[Expense]:
        result = await self.db.execute(
            select(Expense).where(
                and_(
                    Expense.user_id == user_id,
                    Expense.transaction_date >= start_date,
                    Expense.transaction_date <= end_date
                )
            ).order_by(Expense.transaction_date.desc())
        )
        return result.scalars().all()

    async def filter_by_amount(self, user_id: str, min_amount: float, max_amount: float) -> Sequence[Expense]:
        result = await self.db.execute(
            select(Expense).where(
                and_(
                    Expense.user_id == user_id,
                    Expense.amount >= min_amount,
                    Expense.amount <= max_amount
                )
            ).order_by(Expense.amount.desc())
        )
        return result.scalars().all()

    async def get_monthly_summary(self, user_id: str, year: int, month: int) -> float:
        from sqlalchemy import func, extract
        result = await self.db.execute(
            select(func.sum(Expense.amount)).where(
                and_(
                    Expense.user_id == user_id,
                    extract('year', Expense.transaction_date) == year,
                    extract('month', Expense.transaction_date) == month
                )
            )
        )
        return result.scalar() or 0.0

    async def get_statistics(self, user_id: str, start_date: date, end_date: date) -> dict:
        from sqlalchemy import func
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
                    Expense.transaction_date >= start_date,
                    Expense.transaction_date <= end_date
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
