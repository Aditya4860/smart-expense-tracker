import pytest
from uuid import uuid4
from datetime import date, datetime, timezone
from unittest.mock import AsyncMock
from app.services.income_service import IncomeService
from app.schemas.income_schema import IncomeCreate, IncomeUpdate
from app.models.income import Income
from app.core.exceptions import BadRequestException, NotFoundException


@pytest.fixture
def mock_repo():
    return AsyncMock()


@pytest.fixture
def income_service(mock_repo):
    return IncomeService(repository=mock_repo)


@pytest.mark.asyncio
async def test_create_income_success(income_service, mock_repo):
    user_id = uuid4()
    cat_id = uuid4()
    income_in = IncomeCreate(
        source="Salary",
        amount=4500.0,
        category_id=cat_id,
        date=date(2026, 3, 1),
        description="Monthly Salary"
    )
    mock_income = Income(
        id=uuid4(),
        user_id=user_id,
        source=income_in.source,
        amount=income_in.amount,
        category_id=cat_id,
        date=income_in.date,
        description=income_in.description,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    mock_repo.create_income.return_value = mock_income

    result = await income_service.create_income(user_id, income_in)
    assert result.source == "Salary"
    assert result.amount == 4500.0
    mock_repo.create_income.assert_called_once_with(user_id, income_in)


@pytest.mark.asyncio
async def test_create_income_invalid_amount():
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        IncomeCreate(
            source="Bonus",
            amount=0.0,
            category_id=uuid4(),
            date=date.today()
        )


@pytest.mark.asyncio
async def test_get_income_not_found(income_service, mock_repo):
    mock_repo.get_income.return_value = None
    with pytest.raises(NotFoundException):
        await income_service.get_income(str(uuid4()), uuid4())


@pytest.mark.asyncio
async def test_list_incomes_pagination(income_service, mock_repo):
    user_id = uuid4()
    mock_repo.list_incomes.return_value = []
    
    res = await income_service.list_incomes(user_id, skip=10, limit=25)
    assert res == []
    mock_repo.list_incomes.assert_called_once_with(
        user_id=user_id,
        skip=10,
        limit=25,
        category_id=None,
        start_date=None,
        end_date=None,
        search_query=None
    )


@pytest.mark.asyncio
async def test_list_incomes_invalid_pagination(income_service):
    user_id = uuid4()
    with pytest.raises(BadRequestException):
        await income_service.list_incomes(user_id, skip=-1, limit=10)


@pytest.mark.asyncio
async def test_update_income_not_found(income_service, mock_repo):
    mock_repo.update_income.return_value = None
    with pytest.raises(NotFoundException):
        await income_service.update_income(str(uuid4()), uuid4(), IncomeUpdate(source="New Source"))


@pytest.mark.asyncio
async def test_delete_income_success(income_service, mock_repo):
    mock_repo.delete_income.return_value = True
    result = await income_service.delete_income(str(uuid4()), uuid4())
    assert result is True


@pytest.mark.asyncio
async def test_delete_income_not_found(income_service, mock_repo):
    mock_repo.delete_income.return_value = False
    with pytest.raises(NotFoundException):
        await income_service.delete_income(str(uuid4()), uuid4())


@pytest.mark.asyncio
async def test_filter_by_date_invalid_range(income_service):
    user_id = uuid4()
    with pytest.raises(BadRequestException):
        await income_service.filter_by_date(user_id, date(2026, 5, 10), date(2026, 5, 1))


@pytest.mark.asyncio
async def test_search_incomes_empty_query(income_service):
    user_id = uuid4()
    with pytest.raises(BadRequestException):
        await income_service.search_incomes(user_id, "   ")
