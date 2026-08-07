import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import date
from decimal import Decimal

from app.models.enums import ReminderType, ReminderFrequency, ReminderStatus, NotificationType
from app.schemas.reminder_schema import ReminderCreate, ReminderUpdate, ReminderSnooze
from app.services.reminder_service import ReminderService
from app.core.exceptions import NotFoundException, BadRequestException

@pytest.fixture
def mock_repo():
    return AsyncMock()

@pytest.fixture
def mock_category_repo():
    return AsyncMock()

@pytest.fixture
def mock_notification_repo():
    return AsyncMock()

@pytest.fixture
def service(mock_repo, mock_category_repo, mock_notification_repo):
    return ReminderService(
        repository=mock_repo,
        category_repository=mock_category_repo,
        notification_repository=mock_notification_repo,
    )

@pytest.mark.asyncio
async def test_create_reminder_success(service, mock_repo):
    user_id = uuid4()
    dto = ReminderCreate(
        title="Insurance Premium",
        amount=15000.0,
        type=ReminderType.BILL,
        frequency=ReminderFrequency.MONTHLY,
        due_date=date(2026, 9, 1),
    )
    mock_repo.create_reminder.return_value = MagicMock(
        id=uuid4(),
        title="Insurance Premium",
        amount=15000.0,
    )

    res = await service.create_reminder(user_id, dto)
    assert res.title == "Insurance Premium"
    mock_repo.create_reminder.assert_called_once()

@pytest.mark.asyncio
async def test_create_reminder_invalid_amount(service):
    with pytest.raises(BadRequestException):
        dto = ReminderCreate.model_construct(
            title="Invalid",
            amount=-20.0,
            type=ReminderType.CUSTOM,
            frequency=ReminderFrequency.ONCE,
            due_date=date.today(),
            is_auto_notified=True,
        )
        await service.create_reminder(uuid4(), dto)

@pytest.mark.asyncio
async def test_complete_once_reminder(service, mock_repo):
    user_id = uuid4()
    rem_id = str(uuid4())
    mock_item = MagicMock(
        id=rem_id,
        user_id=user_id,
        frequency=ReminderFrequency.ONCE,
        due_date=date(2026, 8, 1),
        status=ReminderStatus.PENDING,
    )
    mock_repo.get_reminder.return_value = mock_item
    mock_repo.update_reminder.return_value = mock_item

    await service.complete_reminder(rem_id, user_id)
    mock_repo.update_reminder.assert_called_once()
    mock_repo.add_history.assert_called_once()

@pytest.mark.asyncio
async def test_complete_recurring_reminder_advances_date(service, mock_repo):
    user_id = uuid4()
    rem_id = str(uuid4())
    mock_item = MagicMock(
        id=rem_id,
        user_id=user_id,
        frequency=ReminderFrequency.MONTHLY,
        due_date=date(2026, 8, 15),
        status=ReminderStatus.PENDING,
    )
    mock_repo.get_reminder.return_value = mock_item
    mock_repo.update_reminder.return_value = mock_item

    await service.complete_reminder(rem_id, user_id)
    mock_repo.update_reminder.assert_called_once()
    # Check that it recorded history (both COMPLETED and ADVANCED)
    assert mock_repo.add_history.call_count == 2

@pytest.mark.asyncio
async def test_snooze_reminder(service, mock_repo):
    user_id = uuid4()
    rem_id = str(uuid4())
    mock_item = MagicMock(
        id=rem_id,
        user_id=user_id,
        due_date=date(2026, 8, 1),
        status=ReminderStatus.PENDING,
    )
    mock_repo.get_reminder.return_value = mock_item
    mock_repo.update_reminder.return_value = mock_item

    await service.snooze_reminder(rem_id, user_id, ReminderSnooze(days=3))
    mock_repo.update_reminder.assert_called_once()
    mock_repo.add_history.assert_called_once()

@pytest.mark.asyncio
async def test_process_due_reminders_triggers_notification(service, mock_repo, mock_notification_repo):
    user_id = uuid4()
    rem_id = uuid4()
    mock_item = MagicMock(
        id=rem_id,
        user_id=user_id,
        title="Credit Card Bill",
        amount=Decimal("4500.00"),
        type=ReminderType.BILL,
        due_date=date(2026, 8, 1),
        due_time="10:00",
        description="Pay via NetBanking",
        is_auto_notified=True,
    )
    mock_repo.get_due_reminders.return_value = [mock_item]
    mock_repo.db = AsyncMock()

    result = await service.process_due_reminders(user_id, date(2026, 8, 1))
    assert result.notified_count == 1
    mock_notification_repo.create_notification.assert_called_once()
    mock_repo.add_history.assert_called_once()
