import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import date
from decimal import Decimal

from app.models.recurring_transaction import RecurringTransaction
from app.models.enums import TransactionType, RecurringFrequency, RecurringStatus
from app.schemas.recurring_transaction_schema import (
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
)
from app.services.recurring_transaction_service import RecurringTransactionService
from app.core.exceptions import NotFoundException, BadRequestException
from app.utils.date_utils import calculate_next_occurrence, add_months, add_years

def test_date_utils_frequencies():
    start = date(2026, 1, 15)
    assert calculate_next_occurrence(start, RecurringFrequency.DAILY) == date(2026, 1, 16)
    assert calculate_next_occurrence(start, RecurringFrequency.WEEKLY) == date(2026, 1, 22)
    assert calculate_next_occurrence(start, RecurringFrequency.MONTHLY) == date(2026, 2, 15)
    assert calculate_next_occurrence(start, RecurringFrequency.QUARTERLY) == date(2026, 4, 15)
    assert calculate_next_occurrence(start, RecurringFrequency.YEARLY) == date(2027, 1, 15)

def test_date_utils_month_end_clamping():
    jan31 = date(2026, 1, 31)
    assert add_months(jan31, 1) == date(2026, 2, 28)
    assert add_months(jan31, 3) == date(2026, 4, 30)

@pytest.fixture
def mock_repo():
    return AsyncMock()

@pytest.fixture
def mock_expense_repo():
    return AsyncMock()

@pytest.fixture
def mock_income_repo():
    return AsyncMock()

@pytest.fixture
def mock_category_repo():
    return AsyncMock()

@pytest.fixture
def mock_notification_repo():
    return AsyncMock()

@pytest.fixture
def service(mock_repo, mock_expense_repo, mock_income_repo, mock_category_repo, mock_notification_repo):
    return RecurringTransactionService(
        repository=mock_repo,
        expense_repository=mock_expense_repo,
        income_repository=mock_income_repo,
        category_repository=mock_category_repo,
        notification_repository=mock_notification_repo,
    )

@pytest.mark.asyncio
async def test_create_recurring_transaction_success(service, mock_repo, mock_category_repo):
    user_id = uuid4()
    cat_id = uuid4()
    mock_category_repo.get_category.return_value = MagicMock(id=cat_id)
    
    dto = RecurringTransactionCreate(
        type=TransactionType.EXPENSE,
        amount=1500.0,
        frequency=RecurringFrequency.MONTHLY,
        category_id=cat_id,
        title="Streaming subscription",
        start_date=date(2026, 8, 1),
    )
    
    mock_repo.create_recurring_transaction.return_value = MagicMock(
        id=uuid4(),
        amount=1500.0,
        title="Streaming subscription"
    )

    res = await service.create_recurring_transaction(user_id, dto)
    assert res.title == "Streaming subscription"
    mock_repo.create_recurring_transaction.assert_called_once()

@pytest.mark.asyncio
async def test_create_recurring_invalid_amount(service):
    with pytest.raises(BadRequestException):
        dto = RecurringTransactionCreate.model_construct(
            type=TransactionType.EXPENSE,
            amount=-50.0,
            frequency=RecurringFrequency.MONTHLY,
            category_id=uuid4(),
            start_date=date.today(),
            is_never_ending=True,
            auto_process=True,
        )
        await service.create_recurring_transaction(uuid4(), dto)

@pytest.mark.asyncio
async def test_pause_and_resume_recurring(service, mock_repo):
    user_id = uuid4()
    rec_id = str(uuid4())
    
    mock_item = MagicMock(
        id=rec_id,
        user_id=user_id,
        status=RecurringStatus.PAUSED,
        next_date=date(2026, 1, 1),
        frequency=RecurringFrequency.MONTHLY,
    )
    mock_repo.get_recurring_transaction.return_value = mock_item
    mock_repo.update_recurring_transaction.return_value = mock_item

    # Pause
    await service.pause_recurring_transaction(rec_id, user_id)
    mock_repo.update_recurring_transaction.assert_called()

    # Resume
    mock_item.status = RecurringStatus.ACTIVE
    await service.resume_recurring_transaction(rec_id, user_id)
    assert mock_repo.update_recurring_transaction.call_count >= 2

@pytest.mark.asyncio
async def test_skip_occurrence(service, mock_repo):
    user_id = uuid4()
    rec_id = str(uuid4())
    mock_item = MagicMock(
        id=rec_id,
        user_id=user_id,
        next_date=date(2026, 8, 1),
        frequency=RecurringFrequency.MONTHLY,
        is_never_ending=True,
        status=RecurringStatus.ACTIVE,
    )
    mock_repo.get_recurring_transaction.return_value = mock_item
    mock_repo.update_recurring_transaction.return_value = mock_item

    await service.skip_occurrence(rec_id, user_id)
    mock_repo.update_recurring_transaction.assert_called_once()

@pytest.mark.asyncio
async def test_process_expense_occurrence(service, mock_repo, mock_expense_repo, mock_notification_repo):
    user_id = uuid4()
    rec_id = str(uuid4())
    mock_item = MagicMock(
        id=rec_id,
        user_id=user_id,
        type=TransactionType.EXPENSE,
        amount=Decimal("2000.00"),
        frequency=RecurringFrequency.MONTHLY,
        category_id=uuid4(),
        category_name="Rent",
        merchant="Landlord",
        description="Apartment rent",
        payment_method="UPI",
        next_date=date(2026, 8, 1),
        is_never_ending=True,
        status=RecurringStatus.ACTIVE,
    )
    mock_repo.get_recurring_transaction.return_value = mock_item
    mock_repo.db = AsyncMock()
    mock_expense_repo.create_expense.return_value = MagicMock(id=uuid4())

    result = await service.process_occurrence(rec_id, user_id)
    assert result["type"] == "EXPENSE"
    assert result["amount"] == 2000.0
    mock_expense_repo.create_expense.assert_called_once()
    mock_notification_repo.create_notification.assert_called_once()
