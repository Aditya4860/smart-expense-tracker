from typing import Dict, Any
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.repositories.recurring_transaction_repository import RecurringTransactionRepository
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.income_repository import IncomeRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.notification_repository import NotificationRepository
from app.services.recurring_transaction_service import RecurringTransactionService
from app.core.logging import logger

async def run_recurring_transactions_job(session: AsyncSession, target_date: date = None) -> Dict[str, Any]:
    """
    Executes due recurring income and expense transactions for all active users.
    """
    effective_date = target_date or date.today()
    logger.info(f"[Job: RecurringTransactions] Starting execution for date: {effective_date.isoformat()}")

    # Fetch all active users
    result = await session.execute(select(User).where(User.is_active == True))
    users = result.scalars().all()

    total_processed = 0
    total_users = len(users)
    messages = []

    for user in users:
        try:
            rec_repo = RecurringTransactionRepository(session)
            exp_repo = ExpenseRepository(session)
            inc_repo = IncomeRepository(session)
            cat_repo = CategoryRepository(session)
            notif_repo = NotificationRepository(session)

            service = RecurringTransactionService(
                repository=rec_repo,
                expense_repository=exp_repo,
                income_repository=inc_repo,
                category_repository=cat_repo,
                notification_repository=notif_repo,
            )

            res = await service.process_due_transactions(user.id, effective_date)
            if res.processed_count > 0:
                total_processed += res.processed_count
                messages.extend(res.messages)
        except Exception as e:
            logger.error(f"[Job: RecurringTransactions] Error processing user {user.id}: {e}", exc_info=True)

    logger.info(f"[Job: RecurringTransactions] Completed. Processed {total_processed} transactions across {total_users} users.")
    return {
        "job": "recurring_transactions",
        "processed_count": total_processed,
        "users_checked": total_users,
        "messages": messages,
    }
