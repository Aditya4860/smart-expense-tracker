import uuid
from typing import Optional, Sequence
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func, extract
from app.models.income import Income
from app.schemas.income_schema import IncomeCreate, IncomeUpdate

class IncomeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_income(self, user_id: uuid.UUID, income_in: IncomeCreate) -> Income:
        db_income = Income(
            user_id=user_id,
            amount=income_in.amount,
            date=income_in.date,
            source=income_in.source,
            category_id=income_in.category_id
        )
        self.db.add(db_income)
        await self.db.commit()
        await self.db.refresh(db_income)
        return db_income

    async def get_income(self, income_id: str, user_id: uuid.UUID) -> Optional[Income]:
        result = await self.db.execute(
            select(Income).where(and_(Income.id == income_id, Income.user_id == user_id))
        )
        return result.scalars().first()

    async def list_incomes(self, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Sequence[Income]:
        result = await self.db.execute(
            select(Income)
            .where(Income.user_id == user_id)
            .order_by(Income.date.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def update_income(self, income_id: str, user_id: uuid.UUID, income_in: IncomeUpdate) -> Optional[Income]:
        db_income = await self.get_income(income_id, user_id)
        if not db_income:
            return None
            
        update_data = income_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_income, field, value)
                
        await self.db.commit()
        await self.db.refresh(db_income)
        return db_income

    async def delete_income(self, income_id: str, user_id: uuid.UUID) -> bool:
        db_income = await self.get_income(income_id, user_id)
        if not db_income:
            return False
            
        await self.db.delete(db_income)
        await self.db.commit()
        return True

    async def search_incomes(self, user_id: uuid.UUID, query: str) -> Sequence[Income]:
        result = await self.db.execute(
            select(Income).where(
                and_(
                    Income.user_id == user_id,
                    Income.source.ilike(f"%{query}%")
                )
            ).order_by(Income.date.desc())
        )
        return result.scalars().all()

    async def filter_by_category(self, user_id: uuid.UUID, category_id: str) -> Sequence[Income]:
        result = await self.db.execute(
            select(Income).where(
                and_(
                    Income.user_id == user_id,
                    Income.category_id == category_id
                )
            ).order_by(Income.date.desc())
        )
        return result.scalars().all()

    async def filter_by_date(self, user_id: uuid.UUID, start_date: date, end_date: date) -> Sequence[Income]:
        result = await self.db.execute(
            select(Income).where(
                and_(
                    Income.user_id == user_id,
                    Income.date >= start_date,
                    Income.date <= end_date
                )
            ).order_by(Income.date.desc())
        )
        return result.scalars().all()

    async def get_monthly_summary(self, user_id: uuid.UUID, year: int, month: int) -> float:
        result = await self.db.execute(
            select(func.sum(Income.amount)).where(
                and_(
                    Income.user_id == user_id,
                    extract('year', Income.date) == year,
                    extract('month', Income.date) == month
                )
            )
        )
        return result.scalar() or 0.0

    async def get_statistics(self, user_id: uuid.UUID, start_date: date, end_date: date) -> dict:
        result = await self.db.execute(
            select(
                func.count(Income.id).label('total_transactions'),
                func.sum(Income.amount).label('total_amount'),
                func.avg(Income.amount).label('average_amount'),
                func.max(Income.amount).label('max_amount'),
                func.min(Income.amount).label('min_amount')
            ).where(
                and_(
                    Income.user_id == user_id,
                    Income.date >= start_date,
                    Income.date <= end_date
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
