import pytest
from uuid import uuid4
from datetime import date, datetime, timezone
from unittest.mock import AsyncMock
from app.services.goal_service import GoalService
from app.schemas.goal_schema import GoalCreate, GoalUpdate
from app.models.goal import Goal
from app.models.enums import GoalStatus
from app.core.exceptions import BadRequestException, NotFoundException


@pytest.fixture
def mock_repo():
    return AsyncMock()


@pytest.fixture
def goal_service(mock_repo):
    return GoalService(repository=mock_repo)


@pytest.mark.asyncio
async def test_create_goal_success(goal_service, mock_repo):
    user_id = uuid4()
    goal_in = GoalCreate(
        name="Emergency Fund",
        target_amount=10000.0,
        deadline=date(2027, 1, 1),
        description="6 months savings",
        priority="high"
    )
    mock_goal = Goal(
        id=uuid4(),
        user_id=user_id,
        name=goal_in.name,
        target_amount=goal_in.target_amount,
        current_amount=0.0,
        deadline=goal_in.deadline,
        description=goal_in.description,
        priority=goal_in.priority,
        status=GoalStatus.ACTIVE,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    mock_repo.create_goal.return_value = mock_goal

    result = await goal_service.create_goal(user_id, goal_in)
    assert result.name == "Emergency Fund"
    assert result.target_amount == 10000.0
    mock_repo.create_goal.assert_called_once_with(user_id, goal_in)


@pytest.mark.asyncio
async def test_create_goal_invalid_amount():
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        GoalCreate(
            name="Vacation",
            target_amount=-500.0
        )


@pytest.mark.asyncio
async def test_get_goal_not_found(goal_service, mock_repo):
    mock_repo.get_goal.return_value = None
    with pytest.raises(NotFoundException):
        await goal_service.get_goal(str(uuid4()), uuid4())


@pytest.mark.asyncio
async def test_list_goals_pagination(goal_service, mock_repo):
    user_id = uuid4()
    mock_repo.list_goals.return_value = []
    
    res = await goal_service.list_goals(user_id, skip=5, limit=20)
    assert res == []
    mock_repo.list_goals.assert_called_once_with(user_id, 5, 20)


@pytest.mark.asyncio
async def test_list_goals_invalid_pagination(goal_service):
    user_id = uuid4()
    with pytest.raises(BadRequestException):
        await goal_service.list_goals(user_id, skip=-1, limit=10)

    with pytest.raises(BadRequestException):
        await goal_service.list_goals(user_id, skip=0, limit=0)


@pytest.mark.asyncio
async def test_update_goal_not_found(goal_service, mock_repo):
    mock_repo.update_goal.return_value = None
    with pytest.raises(NotFoundException):
        await goal_service.update_goal(str(uuid4()), uuid4(), GoalUpdate(name="New Name"))


@pytest.mark.asyncio
async def test_delete_goal_success(goal_service, mock_repo):
    mock_repo.delete_goal.return_value = True
    result = await goal_service.delete_goal(str(uuid4()), uuid4())
    assert result is True


@pytest.mark.asyncio
async def test_delete_goal_not_found(goal_service, mock_repo):
    mock_repo.delete_goal.return_value = False
    with pytest.raises(NotFoundException):
        await goal_service.delete_goal(str(uuid4()), uuid4())


@pytest.mark.asyncio
async def test_get_goal_progress_calculation(goal_service, mock_repo):
    user_id = uuid4()
    goal_id = str(uuid4())
    mock_goal = Goal(
        id=uuid4(),
        user_id=user_id,
        name="House Downpayment",
        target_amount=50000.0,
        current_amount=25000.0,
        deadline=date(2028, 1, 1),
        description="Down payment fund",
        priority="high",
        status=GoalStatus.ACTIVE,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    mock_repo.get_goal.return_value = mock_goal

    progress = await goal_service.get_goal_progress(goal_id, user_id)
    assert progress.name == "House Downpayment"
    assert progress.target_amount == 50000.0
    assert progress.current_amount == 25000.0
    assert progress.remaining_amount == 25000.0
    assert progress.completion_percentage == 50.0
    assert progress.priority == "high"
    assert progress.description == "Down payment fund"


@pytest.mark.asyncio
async def test_get_goal_progress_overachieved(goal_service, mock_repo):
    user_id = uuid4()
    goal_id = str(uuid4())
    mock_goal = Goal(
        id=uuid4(),
        user_id=user_id,
        name="Laptop",
        target_amount=1000.0,
        current_amount=1200.0,
        deadline=date(2026, 12, 1),
        description="MacBook",
        priority="medium",
        status=GoalStatus.COMPLETED,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    mock_repo.get_goal.return_value = mock_goal

    progress = await goal_service.get_goal_progress(goal_id, user_id)
    assert progress.remaining_amount == 0.0
    assert progress.completion_percentage == 100.0
