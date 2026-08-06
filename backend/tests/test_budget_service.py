import pytest
from uuid import uuid4
from datetime import date, datetime, timezone
from unittest.mock import AsyncMock
from app.services.budget_service import BudgetService
from app.schemas.budget_schema import BudgetCreate, BudgetUpdate
from app.models.budget import Budget
from app.models.enums import BudgetPeriod
from app.core.exceptions import BadRequestException, NotFoundException


@pytest.fixture
def mock_repo():
    return AsyncMock()


@pytest.fixture
def budget_service(mock_repo):
    return BudgetService(repository=mock_repo)


@pytest.mark.asyncio
async def test_create_budget_success(budget_service, mock_repo):
    user_id = uuid4()
    cat_id = uuid4()
    budget_in = BudgetCreate(
        category_id=cat_id,
        amount=500.0,
        period=BudgetPeriod.MONTHLY
    )
    mock_budget = Budget(
        id=uuid4(),
        user_id=user_id,
        category_id=cat_id,
        amount=500.0,
        period=BudgetPeriod.MONTHLY,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    mock_repo.create_budget.return_value = mock_budget

    result = await budget_service.create_budget(user_id, budget_in)
    assert result.amount == 500.0
    mock_repo.create_budget.assert_called_once_with(user_id, budget_in)


@pytest.mark.asyncio
async def test_create_budget_invalid_amount():
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        BudgetCreate(
            category_id=uuid4(),
            amount=-100.0,
            period=BudgetPeriod.MONTHLY,
            start_date=date(2026, 1, 1)
        )


@pytest.mark.asyncio
async def test_get_budget_not_found(budget_service, mock_repo):
    mock_repo.get_budget.return_value = None
    with pytest.raises(NotFoundException):
        await budget_service.get_budget(str(uuid4()), uuid4())


@pytest.mark.asyncio
async def test_list_budgets_pagination(budget_service, mock_repo):
    user_id = uuid4()
    mock_repo.list_budgets.return_value = []
    
    res = await budget_service.list_budgets(user_id, skip=0, limit=50)
    assert res == []
    mock_repo.list_budgets.assert_called_once_with(user_id, 0, 50)


@pytest.mark.asyncio
async def test_list_budgets_invalid_pagination(budget_service):
    user_id = uuid4()
    with pytest.raises(BadRequestException):
        await budget_service.list_budgets(user_id, skip=-5, limit=10)

    with pytest.raises(BadRequestException):
        await budget_service.list_budgets(user_id, skip=0, limit=-1)


@pytest.mark.asyncio
async def test_update_budget_not_found(budget_service, mock_repo):
    mock_repo.update_budget.return_value = None
    with pytest.raises(NotFoundException):
        await budget_service.update_budget(str(uuid4()), uuid4(), BudgetUpdate(amount=750.0))


@pytest.mark.asyncio
async def test_delete_budget_success(budget_service, mock_repo):
    mock_repo.delete_budget.return_value = True
    result = await budget_service.delete_budget(str(uuid4()), uuid4())
    assert result is True


@pytest.mark.asyncio
async def test_delete_budget_not_found(budget_service, mock_repo):
    mock_repo.delete_budget.return_value = False
    with pytest.raises(NotFoundException):
        await budget_service.delete_budget(str(uuid4()), uuid4())


@pytest.mark.asyncio
async def test_get_budget_utilization_not_found(budget_service, mock_repo):
    mock_repo.get_budget_utilization.return_value = None
    with pytest.raises(NotFoundException):
        await budget_service.get_budget_utilization(str(uuid4()), uuid4(), date.today())
