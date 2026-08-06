import uuid
from typing import Optional, Sequence
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, func, extract
from sqlalchemy.orm import selectinload
from app.models.income import Income
from app.schemas.income_schema import IncomeCreate, IncomeUpdate
from app.core.logging import logger

class IncomeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_income(self, user_id: uuid.UUID, income_in: IncomeCreate) -> Income:
        try:
            db_income = Income(
                user_id=user_id,
                amount=income_in.amount,
                date=income_in.date,
                source=income_in.source,
                description=income_in.description,
                category_id=income_in.category_id
            )
            self.db.add(db_income)
            await self.db.commit()
            return await self.get_income(str(db_income.id), user_id)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating income: {e}")
            raise

    async def get_income(self, income_id: str, user_id: uuid.UUID) -> Optional[Income]:
        result = await self.db.execute(
            select(Income)
            .options(selectinload(Income.category))
            .where(and_(Income.id == income_id, Income.user_id == user_id))
        )
        income = result.scalars().first()
        if income and income.category:
            income.category_name = income.category.name
        return income

    async def list_incomes(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[uuid.UUID] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        search_query: Optional[str] = None
    ) -> Sequence[Income]:
        filters = [Income.user_id == user_id]

        if category_id:
            filters.append(Income.category_id == category_id)
        if start_date:
            filters.append(Income.date >= start_date)
        if end_date:
            filters.append(Income.date <= end_date)
        if search_query and search_query.strip():
            from app.core.sanitization import escape_like_pattern
            clean_term = escape_like_pattern(search_query)
            term = f"%{clean_term}%"
            filters.append(or_(Income.source.ilike(term), Income.description.ilike(term)))

        query = (
            select(Income)
            .options(selectinload(Income.category))
            .where(and_(*filters))
            .order_by(Income.date.desc(), Income.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await self.db.execute(query)
        incomes = result.scalars().all()
        for income in incomes:
            if income.category:
                income.category_name = income.category.name
        return incomes

    async def update_income(self, income_id: str, user_id: uuid.UUID, income_in: IncomeUpdate) -> Optional[Income]:
        try:
            db_income = await self.get_income(income_id, user_id)
            if not db_income:
                return None
                
            update_data = income_in.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_income, field, value)
                    
            await self.db.commit()
            return await self.get_income(income_id, user_id)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating income {income_id}: {e}")
            raise

    async def delete_income(self, income_id: str, user_id: uuid.UUID) -> bool:
        try:
            db_income = await self.get_income(income_id, user_id)
            if not db_income:
                return False
                
            await self.db.delete(db_income)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting income {income_id}: {e}")
            raise

    async def search_incomes(self, user_id: uuid.UUID, query: str, skip: int = 0, limit: int = 100) -> Sequence[Income]:
        return await self.list_incomes(user_id=user_id, skip=skip, limit=limit, search_query=query)

    async def filter_by_category(self, user_id: uuid.UUID, category_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Sequence[Income]:
        return await self.list_incomes(user_id=user_id, skip=skip, limit=limit, category_id=category_id)

    async def filter_by_date(self, user_id: uuid.UUID, start_date: date, end_date: date, skip: int = 0, limit: int = 100) -> Sequence[Income]:
        return await self.list_incomes(user_id=user_id, skip=skip, limit=limit, start_date=start_date, end_date=end_date)

    async def get_monthly_summary(self, user_id: uuid.UUID, year: int, month: int) -> float:
        result = await self.db.execute(
            select(func.coalesce(func.sum(Income.amount), 0)).where(
                and_(
                    Income.user_id == user_id,
                    extract('year', Income.date) == year,
                    extract('month', Income.date) == month
                )
            )
        )
        return float(result.scalar() or 0.0)

    async def get_statistics(self, user_id: uuid.UUID, start_date: date, end_date: date) -> dict:
        result = await self.db.execute(
            select(
                func.count(Income.id).label('total_transactions'),
                func.coalesce(func.sum(Income.amount), 0).label('total_amount'),
                func.coalesce(func.avg(Income.amount), 0).label('average_amount'),
                func.coalesce(func.max(Income.amount), 0).label('max_amount'),
                func.coalesce(func.min(Income.amount), 0).label('min_amount')
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
