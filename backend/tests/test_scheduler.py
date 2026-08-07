import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from fastapi.testclient import TestClient

from app.models.enums import (
    TransactionType,
    RecurringFrequency,
    ReminderType,
    ReminderFrequency,
    ReminderStatus,
    BudgetPeriod,
    GoalStatus,
    NotificationType,
)
from app.models.user import User
from app.models.category import Category
from app.models.recurring_transaction import RecurringTransaction
from app.models.reminder import Reminder
from app.models.budget import Budget
from app.models.goal import Goal
from app.models.expense import Expense
from app.models.income import Income
from app.models.notification import Notification

from app.core.scheduler import (
    start_scheduler,
    shutdown_scheduler,
    get_scheduler_status,
    scheduler,
)
from app.jobs.hourly_runner import run_hourly_master_job, execute_with_retry
from app.jobs.recurring_jobs import run_recurring_transactions_job
from app.jobs.reminder_jobs import run_reminders_job
from app.jobs.budget_jobs import run_budget_checks_job
from app.jobs.goal_jobs import run_goal_checks_job
from app.jobs.summary_jobs import run_monthly_summaries_job
from main import app

client = TestClient(app)


@pytest.mark.asyncio
async def test_scheduler_lifecycle():
    """Test start, status report, and shutdown of the APScheduler instance."""
    start_scheduler()
    status = get_scheduler_status()
    assert status["status"] == "running"
    assert status["total_jobs"] >= 1
    assert any(j["id"] == "hourly_master_job" for j in status["jobs"])
    
    shutdown_scheduler()
    status_after = get_scheduler_status()
    assert status_after["status"] == "stopped"


@pytest.mark.asyncio
async def test_hourly_master_job_execution():
    """Test full execution of the master hourly job with mocked session."""
    with patch("app.jobs.hourly_runner.AsyncSessionLocal") as mock_session_local:
        mock_session = AsyncMock()
        mock_session_local.return_value.__aenter__.return_value = mock_session

        # Mock user query in subjobs
        mock_user = User(email="test@example.com", is_active=True)
        mock_user.id = uuid4()
        
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_user]
        mock_result.scalar_one.return_value = Decimal("0.00")
        mock_session.execute.return_value = mock_result

        res = await run_hourly_master_job(target_date=date.today())
        assert res["status"] in ["success", "partial_failure"]
        assert "recurring_transactions" in res["components"]
        assert "reminders" in res["components"]
        assert "budget_checks" in res["components"]
        assert "goal_checks" in res["components"]


@pytest.mark.asyncio
async def test_recurring_transactions_job_runner():
    """Test background execution of due recurring transactions."""
    mock_session = AsyncMock()
    mock_user = User(email="active@example.com", is_active=True)
    mock_user.id = uuid4()

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_user]
    mock_session.execute.return_value = mock_result

    with patch("app.jobs.recurring_jobs.RecurringTransactionService") as MockService:
        mock_instance = MockService.return_value
        mock_instance.process_due_transactions = AsyncMock(
            return_value=MagicMock(processed_count=2, messages=["Success"])
        )

        res = await run_recurring_transactions_job(mock_session, target_date=date.today())
        assert res["job"] == "recurring_transactions"
        assert res["processed_count"] == 2
        assert res["users_checked"] == 1


@pytest.mark.asyncio
async def test_reminders_job_runner():
    """Test background notification generation for due reminders."""
    mock_session = AsyncMock()
    mock_user = User(email="active@example.com", is_active=True)
    mock_user.id = uuid4()

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_user]
    mock_session.execute.return_value = mock_result

    with patch("app.jobs.reminder_jobs.ReminderService") as MockService:
        mock_instance = MockService.return_value
        mock_instance.process_due_reminders = AsyncMock(
            return_value=MagicMock(notified_count=3, messages=["Notified"])
        )

        res = await run_reminders_job(mock_session, target_date=date.today())
        assert res["job"] == "reminders"
        assert res["notified_count"] == 3
        assert res["users_checked"] == 1


@pytest.mark.asyncio
async def test_budget_checks_job_runner():
    """Test background evaluation of budget spending thresholds."""
    mock_session = AsyncMock()
    mock_user = User(email="budget@example.com", is_active=True)
    mock_user.id = uuid4()

    # User query result
    res_users = MagicMock()
    res_users.scalars.return_value.all.return_value = [mock_user]

    # Budget query result
    mock_budget = Budget(
        user_id=mock_user.id,
        category_id=uuid4(),
        amount=Decimal("1000.00"),
        period=BudgetPeriod.MONTHLY,
    )
    mock_budget.id = uuid4()
    mock_budget.category = Category(name="Dining")
    res_budgets = MagicMock()
    res_budgets.scalars.return_value.all.return_value = [mock_budget]

    # Spent query result (950 => 95%)
    res_spent = MagicMock()
    res_spent.scalar_one.return_value = Decimal("950.00")

    # Notifications check result
    res_notifs = MagicMock()
    res_notifs.scalars.return_value.all.return_value = []

    mock_session.execute.side_effect = [
        res_users,
        res_budgets,
        res_spent,
        res_notifs,
    ]

    res = await run_budget_checks_job(mock_session, target_date=date.today())
    assert res["job"] == "budget_checks"
    assert res["budgets_evaluated"] == 1
    assert res["notifications_sent"] == 1
    assert mock_session.add.called
    assert mock_session.commit.called


@pytest.mark.asyncio
async def test_goal_checks_job_runner():
    """Test background evaluation of savings goal milestones and completion."""
    mock_session = AsyncMock()
    mock_user = User(email="goal@example.com", is_active=True)
    mock_user.id = uuid4()

    res_users = MagicMock()
    res_users.scalars.return_value.all.return_value = [mock_user]

    mock_goal = Goal(
        user_id=mock_user.id,
        name="House Downpayment",
        target_amount=Decimal("100000.00"),
        current_amount=Decimal("100000.00"),
        status=GoalStatus.ACTIVE,
    )
    mock_goal.id = uuid4()
    res_goals = MagicMock()
    res_goals.scalars.return_value.all.return_value = [mock_goal]

    mock_session.execute.side_effect = [
        res_users,
        res_goals,
    ]

    res = await run_goal_checks_job(mock_session, target_date=date.today())
    assert res["job"] == "goal_checks"
    assert res["goals_evaluated"] == 1
    assert res["notifications_sent"] == 1
    assert mock_goal.status == GoalStatus.COMPLETED


@pytest.mark.asyncio
async def test_monthly_summaries_job_runner():
    """Test background generation of monthly summaries."""
    mock_session = AsyncMock()
    mock_user = User(email="summary@example.com", is_active=True)
    mock_user.id = uuid4()

    res_users = MagicMock()
    res_users.scalars.return_value.all.return_value = [mock_user]

    res_inc = MagicMock()
    res_inc.scalar_one.return_value = Decimal("80000.00")

    res_exp = MagicMock()
    res_exp.scalar_one.return_value = Decimal("45000.00")

    res_notifs = MagicMock()
    res_notifs.scalars.return_value.all.return_value = []

    mock_session.execute.side_effect = [
        res_users,
        res_inc,
        res_exp,
        res_notifs,
    ]

    res = await run_monthly_summaries_job(mock_session, reference_date=date.today())
    assert res["job"] == "monthly_summaries"
    assert res["summaries_generated"] == 1
    assert mock_session.add.called
    assert mock_session.commit.called


def test_health_endpoint_includes_scheduler():
    """Test that /health returns overall system health and scheduler metadata."""
    resp = client.get("/health")
    assert resp.status_code in [200, 503]
    body = resp.json()
    data = body.get("data", body)
    assert "services" in data
    assert "database" in data["services"]
    assert "scheduler" in data["services"]
    assert data["services"]["scheduler"]["engine"].startswith("APScheduler")



@pytest.mark.asyncio
async def test_retry_mechanism():
    """Test execute_with_retry backoff wrapper."""
    call_count = 0

    async def transient_failing_job():
        nonlocal call_count
        call_count += 1
        if call_count < 2:
            from sqlalchemy.exc import OperationalError
            raise OperationalError("Database locked", params=None, orig=Exception("DB locked"))
        return {"status": "ok", "retried": True}

    result = await execute_with_retry(transient_failing_job)
    assert result["status"] == "ok"
    assert call_count == 2
