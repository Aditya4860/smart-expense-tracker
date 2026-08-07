from typing import Dict, Any
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.repositories.reminder_repository import ReminderRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.notification_repository import NotificationRepository
from app.services.reminder_service import ReminderService
from app.core.logging import logger

async def run_reminders_job(session: AsyncSession, target_date: date = None) -> Dict[str, Any]:
    """
    Checks and generates notifications for due reminders across all active users.
    """
    effective_date = target_date or date.today()
    logger.info(f"[Job: Reminders] Starting reminder check for date: {effective_date.isoformat()}")

    result = await session.execute(select(User).where(User.is_active == True))
    users = result.scalars().all()

    total_notified = 0
    total_users = len(users)
    messages = []

    for user in users:
        try:
            rem_repo = ReminderRepository(session)
            cat_repo = CategoryRepository(session)
            notif_repo = NotificationRepository(session)

            service = ReminderService(
                repository=rem_repo,
                category_repository=cat_repo,
                notification_repository=notif_repo,
            )

            res = await service.process_due_reminders(user.id, effective_date)
            if res.notified_count > 0:
                total_notified += res.notified_count
                messages.extend(res.messages)
        except Exception as e:
            logger.error(f"[Job: Reminders] Error processing user {user.id}: {e}", exc_info=True)

    logger.info(f"[Job: Reminders] Completed. Notified {total_notified} reminders across {total_users} users.")
    return {
        "job": "reminders",
        "notified_count": total_notified,
        "users_checked": total_users,
        "messages": messages,
    }
