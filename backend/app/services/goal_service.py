import uuid
from typing import Optional, Sequence
from app.models.goal import Goal
from app.schemas.goal_schema import GoalCreate, GoalUpdate, GoalProgressResponse
from app.repositories.goal_repository import GoalRepository
from app.core.exceptions import BadRequestException, NotFoundException

class GoalService:
    def __init__(self, repository: GoalRepository):
        self.repository = repository

    async def create_goal(self, user_id: uuid.UUID, goal_in: GoalCreate) -> Goal:
        if goal_in.target_amount <= 0:
            raise BadRequestException("Target amount must be strictly positive.")
            
        return await self.repository.create_goal(user_id, goal_in)

    async def get_goal(self, goal_id: str, user_id: uuid.UUID) -> Goal:
        goal = await self.repository.get_goal(goal_id, user_id)
        if not goal:
            raise NotFoundException("Goal not found")
        return goal

    async def list_goals(self, user_id: uuid.UUID) -> Sequence[Goal]:
        return await self.repository.list_goals(user_id)

    async def update_goal(self, goal_id: str, user_id: uuid.UUID, goal_in: GoalUpdate) -> Goal:
        if goal_in.target_amount is not None and goal_in.target_amount <= 0:
            raise BadRequestException("Target amount must be strictly positive.")
            
        goal = await self.repository.update_goal(goal_id, user_id, goal_in)
        if not goal:
            raise NotFoundException("Goal not found")
        return goal

    async def delete_goal(self, goal_id: str, user_id: uuid.UUID) -> bool:
        success = await self.repository.delete_goal(goal_id, user_id)
        if not success:
            raise NotFoundException("Goal not found")
        return success

    async def get_goal_progress(self, goal_id: str, user_id: uuid.UUID) -> GoalProgressResponse:
        goal = await self.get_goal(goal_id, user_id)
        
        target = float(goal.target_amount)
        current = float(goal.current_amount)
        remaining = max(0.0, target - current)
        
        if target > 0:
            completion_percentage = min(100.0, (current / target) * 100.0)
        else:
            completion_percentage = 0.0
            
        return GoalProgressResponse(
            id=goal.id,
            user_id=goal.user_id,
            name=goal.name,
            target_amount=target,
            current_amount=current,
            deadline=goal.deadline,
            status=goal.status,
            created_at=goal.created_at,
            updated_at=goal.updated_at,
            remaining_amount=remaining,
            completion_percentage=completion_percentage
        )
