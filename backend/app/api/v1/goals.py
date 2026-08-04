from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.schemas.goal_schema import GoalCreate, GoalUpdate, GoalResponse, GoalProgressResponse
from app.schemas.goal_contribution_schema import GoalContributionCreate, GoalContributionResponse
from app.repositories.goal_repository import GoalRepository
from app.repositories.goal_contribution_repository import GoalContributionRepository
from app.services.goal_service import GoalService
from app.services.goal_contribution_service import GoalContributionService

router = APIRouter(tags=["Goals"])

def get_goal_service(db: AsyncSession = Depends(get_db_session)) -> GoalService:
    repository = GoalRepository(db)
    return GoalService(repository)

def get_goal_contribution_service(db: AsyncSession = Depends(get_db_session)) -> GoalContributionService:
    repository = GoalContributionRepository(db)
    goal_repo = GoalRepository(db)
    return GoalContributionService(repository, goal_repo)

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_in: GoalCreate,
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service)
):
    """Create a new savings goal."""
    return await service.create_goal(current_user.id, goal_in)

@router.get("", response_model=List[GoalResponse])
async def list_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0, le=1000),
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service)
):
    """List all savings goals."""
    return await service.list_goals(current_user.id, skip=skip, limit=limit)

@router.get("/{id}/progress", response_model=GoalProgressResponse)
async def get_goal_progress(
    id: str,
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service)
):
    """Get goal progress, including remaining amount and completion percentage."""
    return await service.get_goal_progress(id, current_user.id)

@router.get("/{id}", response_model=GoalResponse)
async def get_goal(
    id: str,
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service)
):
    """Get a specific goal by ID."""
    return await service.get_goal(id, current_user.id)

@router.put("/{id}", response_model=GoalResponse)
async def update_goal(
    id: str,
    goal_in: GoalUpdate,
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service)
):
    """Update a specific goal."""
    return await service.update_goal(id, current_user.id, goal_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    id: str,
    current_user: User = Depends(get_current_user),
    service: GoalService = Depends(get_goal_service)
):
    """Delete a specific goal."""
    await service.delete_goal(id, current_user.id)

# Contributions endpoints nested under goals
@router.post("/{id}/contributions", response_model=GoalContributionResponse, status_code=status.HTTP_201_CREATED)
async def add_contribution(
    id: str,
    contribution_in: GoalContributionCreate,
    current_user: User = Depends(get_current_user),
    service: GoalContributionService = Depends(get_goal_contribution_service)
):
    """Add a contribution to a goal."""
    # Ensure URL ID matches payload ID
    if str(contribution_in.goal_id) != id:
        from app.core.exceptions import BadRequestException
        raise BadRequestException("Goal ID in URL does not match payload")
        
    return await service.add_contribution(current_user.id, contribution_in)

@router.get("/{id}/contributions", response_model=List[GoalContributionResponse])
async def list_contributions(
    id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0, le=1000),
    current_user: User = Depends(get_current_user),
    service: GoalContributionService = Depends(get_goal_contribution_service)
):
    """List all contributions for a specific goal."""
    return await service.list_contributions(id, current_user.id, skip=skip, limit=limit)

@router.delete("/contributions/{contribution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contribution(
    contribution_id: str,
    current_user: User = Depends(get_current_user),
    service: GoalContributionService = Depends(get_goal_contribution_service)
):
    """Delete a specific contribution."""
    await service.delete_contribution(contribution_id, current_user.id)
