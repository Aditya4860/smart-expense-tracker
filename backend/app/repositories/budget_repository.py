import uuid
from typing import Optional, Sequence
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func, extract
from app.models.budget import Budget
from app.models.category import Category
from app.models.expense import Expense
from app.schemas.budget_schema import BudgetCreate, BudgetUpdate

class BudgetRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_budget(self, user_id: uuid.UUID, budget_in: BudgetCreate) -> Budget:
        db_budget = Budget(
            user_id=user_id,
            amount=budget_in.amount,
            period=budget_in.period,
            category_id=budget_in.category_id
        )
        self.db.add(db_budget)
        await self.db.commit()
        await self.db.refresh(db_budget)
        return db_budget

    async def get_budget(self, budget_id: str, user_id: uuid.UUID) -> Optional[Budget]:
        result = await self.db.execute(
            select(Budget).where(and_(Budget.id == budget_id, Budget.user_id == user_id))
        )
        return result.scalars().first()

    async def list_budgets(self, user_id: uuid.UUID) -> Sequence[Budget]:
        result = await self.db.execute(
            select(Budget)
            .where(Budget.user_id == user_id)
            .order_by(Budget.created_at.desc())
        )
        return result.scalars().all()

    async def update_budget(self, budget_id: str, user_id: uuid.UUID, budget_in: BudgetUpdate) -> Optional[Budget]:
        db_budget = await self.get_budget(budget_id, user_id)
        if not db_budget:
            return None
            
        update_data = budget_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_budget, field, value)
                
        await self.db.commit()
        await self.db.refresh(db_budget)
        return db_budget

    async def delete_budget(self, budget_id: str, user_id: uuid.UUID) -> bool:
        db_budget = await self.get_budget(budget_id, user_id)
        if not db_budget:
            return False
            
        await self.db.delete(db_budget)
        await self.db.commit()
        return True

    async def get_budget_utilization(self, budget_id: str, user_id: uuid.UUID, target_date: date) -> Optional[dict]:
        db_budget = await self.get_budget(budget_id, user_id)
        if not db_budget:
            return None
            
        # Get category name
        cat_result = await self.db.execute(select(Category).where(Category.id == db_budget.category_id))
        category = cat_result.scalars().first()
        category_name = category.name if category else "Unknown"

        # Calculate utilization
        # Assuming monthly period for expenses
        year = target_date.year
        month = target_date.month

        expense_result = await self.db.execute(
            select(func.sum(Expense.amount)).where(
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
