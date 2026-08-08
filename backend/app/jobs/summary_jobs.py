from typing import Dict, Any
from datetime import date
from calendar import monthrange
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.user import User
from app.models.income import Income
from app.models.expense import Expense
from app.models.notification import Notification
from app.models.enums import NotificationType
from app.core.logging import logger

async def run_monthly_summaries_job(session: AsyncSession, reference_date: date = None) -> Dict[str, Any]:
    """
    Generates and dispatches monthly financial summary notifications for active users.
    Calculates total income, total expenses, net savings, and savings rate.
    """
    today = reference_date or date.today()
    
    # Calculate previous month date range
    if today.month == 1:
        prev_year = today.year - 1
        prev_month = 12
    else:
        prev_year = today.year
        prev_month = today.month - 1

    last_day = monthrange(prev_year, prev_month)[1]
    start_date = date(prev_year, prev_month, 1)
    end_date = date(prev_year, prev_month, last_day)

    month_name = start_date.strftime("%B %Y")
    logger.info(f"[Job: MonthlySummaries] Generating summaries for: {month_name}")

    result = await session.execute(select(User).where(User.is_active == True))
    users = result.scalars().all()

    total_summaries = 0
    messages = []

    for user in users:
        try:
            # Query income for month
            inc_res = await session.execute(
                select(func.coalesce(func.sum(Income.amount), 0.00))
                .where(
                    Income.user_id == user.id,
                    Income.date >= start_date,
                    Income.date <= end_date,
                )
            )
            total_income = float(inc_res.scalar_one())

            # Query expense for month
            exp_res = await session.execute(
                select(func.coalesce(func.sum(Expense.amount), 0.00))
                .where(
                    Expense.user_id == user.id,
                    Expense.date >= start_date,
                    Expense.date <= end_date,
                )
            )
            total_expense = float(exp_res.scalar_one())

            # Only generate summary if user had some financial activity
            if total_income == 0 and total_expense == 0:
                continue

            net_savings = total_income - total_expense
            savings_rate = (net_savings / total_income * 100.0) if total_income > 0 else 0.0

            # Deduplication: Check if summary for this month was already generated
            summary_key = f"{prev_year}-{prev_month:02d}"
            existing = await session.execute(
                select(Notification)
                .where(
                    Notification.user_id == user.id,
                    Notification.type == NotificationType.MONTHLY_SUMMARY.value,
                )
            )
            already_generated = any(
                n.data and n.data.get("period") == summary_key
                for n in existing.scalars().all()
            )

            if not already_generated:
                notif = Notification(
                    user_id=user.id,
                    title=f"📊 Monthly Summary: {month_name}",
                    message=(
                        f"Your summary for {month_name}: "
                        f"Earned ₹{total_income:,.2f}, Spent ₹{total_expense:,.2f}, "
                        f"Saved ₹{net_savings:,.2f} ({savings_rate:.1f}% savings rate)."
                    ),
                    type=NotificationType.MONTHLY_SUMMARY.value,
                    data={
                        "period": summary_key,
                        "month_name": month_name,
                        "total_income": total_income,
                        "total_expense": total_expense,
                        "net_savings": net_savings,
                        "savings_rate": round(savings_rate, 2),
                    },
                )
                session.add(notif)
                total_summaries += 1
                messages.append(f"Generated {month_name} summary for {user.email}.")

            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"[Job: MonthlySummaries] Error generating summary for user {user.id}: {e}", exc_info=True)

    logger.info(f"[Job: MonthlySummaries] Completed. Generated {total_summaries} monthly summaries.")
    return {
        "job": "monthly_summaries",
        "month": month_name,
        "summaries_generated": total_summaries,
        "messages": messages,
    }
