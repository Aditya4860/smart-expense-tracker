import uuid
from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from sqlalchemy.orm import selectinload
from app.models.goal import Goal
from app.schemas.goal_schema import GoalCreate, GoalUpdate
from app.core.logging import logger

class GoalRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_goal(self, user_id: uuid.UUID, goal_in: GoalCreate) -> Goal:
        try:
            db_goal = Goal(
                user_id=user_id,
                name=goal_in.name,
                target_amount=goal_in.target_amount,
                current_amount=goal_in.current_amount,
                deadline=goal_in.deadline,
                description=goal_in.description,
                priority=goal_in.priority,
                status=goal_in.status
            )
            self.db.add(db_goal)
            await self.db.commit()
            await self.db.refresh(db_goal)
            return db_goal
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating goal: {e}")
            raise

    async def get_goal(self, goal_id: str, user_id: uuid.UUID) -> Optional[Goal]:
        result = await self.db.execute(
            select(Goal)
            .options(selectinload(Goal.contributions))
            .where(and_(Goal.id == goal_id, Goal.user_id == user_id))
        )
        return result.scalars().first()

    async def list_goals(self, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Sequence[Goal]:
        result = await self.db.execute(
            select(Goal)
            .where(Goal.user_id == user_id)
            .order_by(Goal.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def update_goal(self, goal_id: str, user_id: uuid.UUID, goal_in: GoalUpdate) -> Optional[Goal]:
        try:
            db_goal = await self.get_goal(goal_id, user_id)
            if not db_goal:
                return None
                
            update_data = goal_in.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_goal, field, value)
                    
            await self.db.commit()
            await self.db.refresh(db_goal)
            return db_goal
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating goal {goal_id}: {e}")
            raise

    async def update_goal_current_amount(self, goal_id: str, new_amount: float) -> Optional[Goal]:
        try:
            result = await self.db.execute(select(Goal).where(Goal.id == goal_id))
            db_goal = result.scalars().first()
            if not db_goal:
                return None
            
            db_goal.current_amount = new_amount
            await self.db.commit()
            await self.db.refresh(db_goal)
            return db_goal
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating goal amount {goal_id}: {e}")
            raise

    async def delete_goal(self, goal_id: str, user_id: uuid.UUID) -> bool:
        try:
            db_goal = await self.get_goal(goal_id, user_id)
            if not db_goal:
                return False
                
            await self.db.delete(db_goal)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting goal {goal_id}: {e}")
            raise
