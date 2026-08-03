import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import date
from app.services.expense_service import ExpenseService
from app.schemas.expense_schema import ExpenseCreate, ExpenseUpdate
from app.core.exceptions import BadRequestException, NotFoundException
from app.models.expense import Expense
from uuid import uuid4

@pytest.fixture
def mock_repo():
    return AsyncMock()

@pytest.fixture
def expense_service(mock_repo):
    return ExpenseService(repository=mock_repo)

@pytest.mark.asyncio
async def test_create_expense_success(expense_service, mock_repo):
    expense_data = ExpenseCreate(
        merchant="Coffee", amount=5.0, category_id=uuid4(), date=date.today()
    )
    user_id = uuid4()
    mock_repo.create_expense.return_value = Expense(id=uuid4(), **expense_data.model_dump())
    
    result = await expense_service.create_expense(user_id, expense_data)
    assert result.merchant == "Coffee"
    assert result.amount == 5.0
    mock_repo.create_expense.assert_called_once_with(user_id, expense_data)

@pytest.mark.asyncio
async def test_create_expense_invalid_amount(expense_service, mock_repo):
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        expense_data = ExpenseCreate(
            merchant="Coffee", amount=-5.0, category_id=uuid4(), date=date.today()
        )

@pytest.mark.asyncio
async def test_get_expense_not_found(expense_service, mock_repo):
    mock_repo.get_expense.return_value = None
    
    with pytest.raises(NotFoundException):
        await expense_service.get_expense("missing_id", "user1")

@pytest.mark.asyncio
async def test_list_expenses_pagination(expense_service, mock_repo):
    mock_repo.list_expenses.return_value = []
    await expense_service.list_expenses("user1", skip=10, limit=5)
    mock_repo.list_expenses.assert_called_once_with("user1", 10, 5)

@pytest.mark.asyncio
async def test_list_expenses_invalid_pagination(expense_service, mock_repo):
    with pytest.raises(BadRequestException):
        await expense_service.list_expenses("user1", skip=-1, limit=10)

@pytest.mark.asyncio
async def test_delete_expense_success(expense_service, mock_repo):
    mock_repo.delete_expense.return_value = True
    result = await expense_service.delete_expense("123", "user1")
    assert result is True

@pytest.mark.asyncio
async def test_delete_expense_not_found(expense_service, mock_repo):
    mock_repo.delete_expense.return_value = False
    with pytest.raises(NotFoundException):
        await expense_service.delete_expense("123", "user1")

@pytest.mark.asyncio
async def test_filter_by_date_invalid_range(expense_service):
    with pytest.raises(BadRequestException):
        await expense_service.filter_by_date("user1", date(2023, 1, 10), date(2023, 1, 5))
