import uuid
from typing import Optional, Sequence, List
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func, extract
from sqlalchemy.orm import selectinload
from app.models.budget import Budget
from app.models.category import Category
from app.models.expense import Expense
from app.schemas.budget_schema import BudgetCreate, BudgetUpdate
from app.core.logging import logger

class BudgetRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_budget_by_category_and_period(self, user_id: uuid.UUID, category_id: uuid.UUID, period) -> Optional[Budget]:
        result = await self.db.execute(
            select(Budget)
            .options(selectinload(Budget.category))
            .where(and_(
                Budget.user_id == user_id,
                Budget.category_id == category_id,
                Budget.period == period
            ))
        )
        budget = result.scalars().first()
        if budget and budget.category:
            budget.category_name = budget.category.name
        return budget

    async def create_budget(self, user_id: uuid.UUID, budget_in: BudgetCreate) -> Budget:
        try:
            existing = await self.get_budget_by_category_and_period(user_id, budget_in.category_id, budget_in.period)
            if existing:
                existing.amount = budget_in.amount
                await self.db.commit()
                return await self.get_budget(str(existing.id), user_id)

            db_budget = Budget(
                user_id=user_id,
                amount=budget_in.amount,
                period=budget_in.period,
                category_id=budget_in.category_id
            )
            self.db.add(db_budget)
            await self.db.commit()
            return await self.get_budget(str(db_budget.id), user_id)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating budget: {e}")
            raise

    async def get_budget(self, budget_id: str, user_id: uuid.UUID) -> Optional[Budget]:
        result = await self.db.execute(
            select(Budget)
            .options(selectinload(Budget.category))
            .where(and_(Budget.id == budget_id, Budget.user_id == user_id))
        )
        budget = result.scalars().first()
        if budget and budget.category:
            budget.category_name = budget.category.name
        return budget

    async def list_budgets(self, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Sequence[Budget]:
        result = await self.db.execute(
            select(Budget)
            .options(selectinload(Budget.category))
            .where(Budget.user_id == user_id)
            .order_by(Budget.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        budgets = result.scalars().all()
        for budget in budgets:
            if budget.category:
                budget.category_name = budget.category.name
        return budgets

    async def update_budget(self, budget_id: str, user_id: uuid.UUID, budget_in: BudgetUpdate) -> Optional[Budget]:
        try:
            db_budget = await self.get_budget(budget_id, user_id)
            if not db_budget:
                return None
                
            update_data = budget_in.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_budget, field, value)
                    
            await self.db.commit()
            return await self.get_budget(budget_id, user_id)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating budget {budget_id}: {e}")
            raise

    async def delete_budget(self, budget_id: str, user_id: uuid.UUID) -> bool:
        try:
            db_budget = await self.get_budget(budget_id, user_id)
            if not db_budget:
                return False
                
            await self.db.delete(db_budget)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting budget {budget_id}: {e}")
            raise

    async def get_budget_utilization(self, budget_id: str, user_id: uuid.UUID, target_date: date) -> Optional[dict]:
        db_budget = await self.get_expense_loaded_budget(budget_id, user_id)
        if not db_budget:
            return None
            
        category_name = db_budget.category.name if db_budget.category else "Unknown"

        year = target_date.year
        month = target_date.month

        expense_result = await self.db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(
                and_(
                    Expense.user_id == user_id,
                    Expense.category_id == db_budget.category_id,
                    extract('year', Expense.date) == year,
                    extract('month', Expense.date) == month
                )
            )
        )
        utilized = float(expense_result.scalar() or 0.0)
        budget_amt = float(db_budget.amount)
        
        return {
            "budget_id": db_budget.id,
            "category_id": db_budget.category_id,
            "category_name": category_name,
            "budget_amount": budget_amt,
            "utilized_amount": utilized,
            "remaining_amount": budget_amt - utilized,
            "period": db_budget.period
        }

    async def get_expense_loaded_budget(self, budget_id: str, user_id: uuid.UUID) -> Optional[Budget]:
        result = await self.db.execute(
            select(Budget)
            .options(selectinload(Budget.category))
            .where(and_(Budget.id == budget_id, Budget.user_id == user_id))
        )
        return result.scalars().first()

    async def list_all_budget_utilizations(self, user_id: uuid.UUID, target_date: date) -> List[dict]:
        budgets = await self.list_budgets(user_id=user_id, skip=0, limit=1000)
        if not budgets:
            return []

        year = target_date.year
        month = target_date.month

        # Optimized single-pass grouped query for all categories
        result = await self.db.execute(
            select(
                Expense.category_id,
                func.coalesce(func.sum(Expense.amount), 0).label("spent")
            ).where(
                and_(
                    Expense.user_id == user_id,
                    extract('year', Expense.date) == year,
                    extract('month', Expense.date) == month
                )
            ).group_by(Expense.category_id)
        )
        spent_map = {row.category_id: float(row.spent) for row in result.all()}

        utilizations = []
        for b in budgets:
            cat_name = b.category.name if b.category else "Unknown"
            utilized = spent_map.get(b.category_id, 0.0)
            budget_amt = float(b.amount)
            utilizations.append({
                "budget_id": b.id,
                "category_id": b.category_id,
                "category_name": cat_name,
                "budget_amount": budget_amt,
                "utilized_amount": utilized,
                "remaining_amount": budget_amt - utilized,
                "period": b.period
            })
        return utilizations
