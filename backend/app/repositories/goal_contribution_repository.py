from typing import Optional, Sequence
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, desc
from app.models.goal_contribution import GoalContribution
from app.schemas.goal_contribution_schema import GoalContributionCreate, GoalContributionUpdate

class GoalContributionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_contribution(self, contribution_in: GoalContributionCreate) -> GoalContribution:
        db_contrib = GoalContribution(
            amount=contribution_in.amount,
            date=contribution_in.date,
            goal_id=contribution_in.goal_id
        )
        self.db.add(db_contrib)
        await self.db.commit()
        await self.db.refresh(db_contrib)
        return db_contrib

    async def get_contribution(self, contribution_id: str) -> Optional[GoalContribution]:
        result = await self.db.execute(
            select(GoalContribution).where(GoalContribution.id == contribution_id)
        )
        return result.scalars().first()

    async def list_contributions(self, goal_id: str) -> Sequence[GoalContribution]:
        result = await self.db.execute(
            select(GoalContribution)
            .where(GoalContribution.goal_id == goal_id)
            .order_by(desc(GoalContribution.date))
        )
        return result.scalars().all()

    async def delete_contribution(self, contribution_id: str) -> bool:
        db_contrib = await self.get_contribution(contribution_id)
        if not db_contrib:
            return False
            
        await self.db.delete(db_contrib)
        await self.db.commit()
        return True
