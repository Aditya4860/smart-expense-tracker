from typing import Dict, Any
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.models.user import User
from app.models.budget import Budget
from app.models.category import Category
from app.models.expense import Expense
from app.models.notification import Notification
from app.models.enums import NotificationType, BudgetPeriod
from app.core.logging import logger

async def run_budget_checks_job(session: AsyncSession, target_date: date = None) -> Dict[str, Any]:
    """
    Evaluates all user budgets against current period spending and dispatches
    in-app alert notifications for exceeded (100%+) or nearing limit (80%, 90%) thresholds.
    """
    now = datetime.now(timezone.utc)
    today = target_date or date.today()
    logger.info(f"[Job: BudgetChecks] Starting budget evaluation for date: {today.isoformat()}")

    # Fetch all active users
    result = await session.execute(select(User).where(User.is_active == True))
    users = result.scalars().all()

    total_checked = 0
    notifications_sent = 0
    messages = []

    for user in users:
        try:
            # Query active budgets with category loaded
            b_result = await session.execute(
                select(Budget)
                .options(selectinload(Budget.category))
                .where(Budget.user_id == user.id)
            )
            budgets = b_result.scalars().all()

            for budget in budgets:
                total_checked += 1
                cat_name = budget.category.name if budget.category else "Uncategorized"
                budget_amount = float(budget.amount)

                if budget_amount <= 0:
                    continue

                # Determine period start date
                if budget.period == BudgetPeriod.YEARLY:
                    start_d = date(today.year, 1, 1)
                else:  # MONTHLY default
                    start_d = date(today.year, today.month, 1)


                # Query total spent in current period
                spend_res = await session.execute(
                    select(func.coalesce(func.sum(Expense.amount), 0.00))
                    .where(
                        Expense.user_id == user.id,
                        Expense.category_id == budget.category_id,
                        Expense.date >= start_d,
                        Expense.date <= today,
                    )
                )
                spent = float(spend_res.scalar_one())
                pct = (spent / budget_amount) * 100.0

                # Determine threshold
                notif_type = None
                title = None
                msg = None
                threshold_key = None

                if pct >= 100.0:
                    notif_type = NotificationType.BUDGET_EXCEEDED.value
                    title = f"🚨 Budget Exceeded: {cat_name}"
                    msg = f"You have spent ₹{spent:,.2f} of your ₹{budget_amount:,.2f} {budget.period.value.lower()} budget for {cat_name} ({pct:.0f}%)."
                    threshold_key = "100"
                elif pct >= 90.0:
                    notif_type = NotificationType.BUDGET_WARNING.value
                    title = f"⚠️ Budget Nearing Limit (90%): {cat_name}"
                    msg = f"You have reached 90% of your {budget.period.value.lower()} budget for {cat_name} (₹{spent:,.2f} / ₹{budget_amount:,.2f})."
                    threshold_key = "90"
                elif pct >= 80.0:
                    notif_type = NotificationType.BUDGET_WARNING.value
                    title = f"⚠️ Budget Alert (80%): {cat_name}"
                    msg = f"You have used 80% of your {budget.period.value.lower()} budget for {cat_name} (₹{spent:,.2f} / ₹{budget_amount:,.2f})."
                    threshold_key = "80"

                if notif_type and threshold_key:
                    # Deduplication: Check if notification for this budget & threshold was sent in last 24h
                    one_day_ago = now - timedelta(hours=23)
                    existing = await session.execute(
                        select(Notification)
                        .where(
                            Notification.user_id == user.id,
                            Notification.type == notif_type,
                            Notification.created_at >= one_day_ago,
                        )
                    )
                    existing_notifs = existing.scalars().all()
                    already_notified = any(
                        n.data and n.data.get("budget_id") == str(budget.id) and n.data.get("threshold") == threshold_key
                        for n in existing_notifs
                    )

                    if not already_notified:
                        notif = Notification(
                            user_id=user.id,
                            title=title,
                            message=msg,
                            type=notif_type,
                            data={
                                "budget_id": str(budget.id),
                                "category_id": str(budget.category_id),
                                "category_name": cat_name,
                                "spent": spent,
                                "budget_amount": budget_amount,
                                "threshold": threshold_key,
                                "period": budget.period.value,
                            },
                        )
                        session.add(notif)
                        notifications_sent += 1
                        messages.append(f"Notified {user.email} for budget '{cat_name}' ({threshold_key}%).")

            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"[Job: BudgetChecks] Error evaluating budgets for user {user.id}: {e}", exc_info=True)

    logger.info(f"[Job: BudgetChecks] Completed. Evaluated {total_checked} budgets, sent {notifications_sent} notifications.")
    return {
        "job": "budget_checks",
        "budgets_evaluated": total_checked,
        "notifications_sent": notifications_sent,
        "messages": messages,
    }
