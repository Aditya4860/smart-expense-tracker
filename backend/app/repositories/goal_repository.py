import uuid
from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.models.goal import Goal
from app.schemas.goal_schema import GoalCreate, GoalUpdate

class GoalRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_goal(self, user_id: uuid.UUID, goal_in: GoalCreate) -> Goal:
        db_goal = Goal(
            user_id=user_id,
            name=goal_in.name,
            target_amount=goal_in.target_amount,
            current_amount=goal_in.current_amount,
            deadline=goal_in.deadline,
            status=goal_in.status
        )
        self.db.add(db_goal)
        await self.db.commit()
        await self.db.refresh(db_goal)
        return db_goal

    async def get_goal(self, goal_id: str, user_id: uuid.UUID) -> Optional[Goal]:
        result = await self.db.execute(
            select(Goal).where(and_(Goal.id == goal_id, Goal.user_id == user_id))
        )
        return result.scalars().first()

    async def list_goals(self, user_id: uuid.UUID) -> Sequence[Goal]:
        result = await self.db.execute(
            select(Goal).where(Goal.user_id == user_id).order_by(Goal.created_at.desc())
        )
        return result.scalars().all()

    async def update_goal(self, goal_id: str, user_id: uuid.UUID, goal_in: GoalUpdate) -> Optional[Goal]:
        db_goal = await self.get_goal(goal_id, user_id)
        if not db_goal:
            return None
            
        update_data = goal_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_goal, field, value)
                
        await self.db.commit()
        await self.db.refresh(db_goal)
        return db_goal

    async def update_goal_current_amount(self, goal_id: str, new_amount: float) -> Optional[Goal]:
        result = await self.db.execute(select(Goal).where(Goal.id == goal_id))
        db_goal = result.scalars().first()
        if not db_goal:
            return None
        
        db_goal.current_amount = new_amount
        await self.db.commit()
        await self.db.refresh(db_goal)
        return db_goal

    async def delete_goal(self, goal_id: str, user_id: uuid.UUID) -> bool:
        db_goal = await self.get_goal(goal_id, user_id)
        if not db_goal:
            return False
            
        await self.db.delete(db_goal)
        await self.db.commit()
        return True
