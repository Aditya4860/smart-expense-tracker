import uuid
from typing import Sequence
from app.models.goal_contribution import GoalContribution
from app.schemas.goal_contribution_schema import GoalContributionCreate
from app.repositories.goal_contribution_repository import GoalContributionRepository
from app.repositories.goal_repository import GoalRepository
from app.core.exceptions import BadRequestException, NotFoundException

class GoalContributionService:
    def __init__(self, repository: GoalContributionRepository, goal_repository: GoalRepository):
        self.repository = repository
        self.goal_repository = goal_repository

    async def add_contribution(self, user_id: uuid.UUID, contribution_in: GoalContributionCreate) -> GoalContribution:
        if contribution_in.amount <= 0:
            raise BadRequestException("Contribution amount must be strictly positive.")
            
        # Verify goal exists and belongs to user
        goal = await self.goal_repository.get_goal(str(contribution_in.goal_id), user_id)
        if not goal:
            raise NotFoundException("Goal not found")
            
        # Create the contribution
        contribution = await self.repository.create_contribution(contribution_in)
        
        # Update goal's current amount
        new_amount = float(goal.current_amount) + float(contribution_in.amount)
        await self.goal_repository.update_goal_current_amount(str(goal.id), new_amount)
        
        return contribution

    async def list_contributions(self, goal_id: str, user_id: uuid.UUID) -> Sequence[GoalContribution]:
        goal = await self.goal_repository.get_goal(goal_id, user_id)
        if not goal:
            raise NotFoundException("Goal not found")
            
        return await self.repository.list_contributions(goal_id)

    async def delete_contribution(self, contribution_id: str, user_id: uuid.UUID) -> bool:
        # We need to make sure the user owns the goal this contribution belongs to
        contribution = await self.repository.get_contribution(contribution_id)
        if not contribution:
            raise NotFoundException("Contribution not found")
            
        goal = await self.goal_repository.get_goal(str(contribution.goal_id), user_id)
        if not goal:
            raise NotFoundException("Contribution not found (unauthorized)")
            
        # Delete contribution
        success = await self.repository.delete_contribution(contribution_id)
        
        # Deduct from goal
        if success:
            new_amount = max(0.0, float(goal.current_amount) - float(contribution.amount))
            await self.goal_repository.update_goal_current_amount(str(goal.id), new_amount)
            
        return success
