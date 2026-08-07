from typing import Dict, Any
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.models.goal import Goal
from app.models.notification import Notification
from app.models.enums import NotificationType, GoalStatus
from app.core.logging import logger

async def run_goal_checks_job(session: AsyncSession, target_date: date = None) -> Dict[str, Any]:
    """
    Evaluates savings goals progress, milestone achievements (25%, 50%, 75%),
    goal completion (100%+), and upcoming deadlines (within 7 days).
    """
    now = datetime.now(timezone.utc)
    today = target_date or date.today()
    logger.info(f"[Job: GoalChecks] Starting savings goals evaluation for date: {today.isoformat()}")

    result = await session.execute(select(User).where(User.is_active == True))
    users = result.scalars().all()

    total_checked = 0
    notifications_sent = 0
    messages = []

    for user in users:
        try:
            g_result = await session.execute(
                select(Goal)
                .where(
                    Goal.user_id == user.id,
                    Goal.status == GoalStatus.ACTIVE,
                )
            )
            goals = g_result.scalars().all()

            for goal in goals:
                total_checked += 1
                target = float(goal.target_amount)
                current = float(goal.current_amount)

                if target <= 0:
                    continue

                pct = (current / target) * 100.0

                # 1. Goal Achieved (100%+)
                if pct >= 100.0:
                    goal.status = GoalStatus.COMPLETED
                    notif = Notification(
                        user_id=user.id,
                        title=f"🎯 Goal Achieved: {goal.name}!",
                        message=f"Congratulations! You've achieved your savings target of ₹{target:,.2f} for '{goal.name}'!",
                        type=NotificationType.GOAL_ACHIEVED.value,
                        data={
                            "goal_id": str(goal.id),
                            "goal_name": goal.name,
                            "target_amount": target,
                            "current_amount": current,
                            "achievement": "100%",
                        },
                    )
                    session.add(notif)
                    notifications_sent += 1
                    messages.append(f"Goal '{goal.name}' completed by {user.email}.")
                    continue

                # 2. Milestones (25%, 50%, 75%)
                for milestone in [75, 50, 25]:
                    if pct >= milestone:
                        # Check if already notified for this milestone
                        existing = await session.execute(
                            select(Notification)
                            .where(
                                Notification.user_id == user.id,
                                Notification.type == NotificationType.GOAL_MILESTONE.value,
                            )
                        )
                        existing_notifs = existing.scalars().all()
                        already_notified = any(
                            n.data and n.data.get("goal_id") == str(goal.id) and n.data.get("milestone") == f"{milestone}%"
                            for n in existing_notifs
                        )

                        if not already_notified:
                            notif = Notification(
                                user_id=user.id,
                                title=f"🎯 Milestone Reached: {goal.name} ({milestone}%)",
                                message=f"Great progress! You've saved {milestone}% (₹{current:,.2f} of ₹{target:,.2f}) towards '{goal.name}'.",
                                type=NotificationType.GOAL_MILESTONE.value,
                                data={
                                    "goal_id": str(goal.id),
                                    "goal_name": goal.name,
                                    "milestone": f"{milestone}%",
                                    "current_amount": current,
                                    "target_amount": target,
                                },
                            )
                            session.add(notif)
                            notifications_sent += 1
                            messages.append(f"Milestone {milestone}% notified for goal '{goal.name}'.")
                        break  # Stop checking lower milestones once highest reached is handled

                # 3. Deadline Check (within 7 days)
                if goal.deadline and pct < 100.0:
                    days_remaining = (goal.deadline - today).days
                    if 0 <= days_remaining <= 7:
                        # Deduplicate: Only notify once every 3 days for deadline warning
                        three_days_ago = now - timedelta(days=3)
                        existing_dl = await session.execute(
                            select(Notification)
                            .where(
                                Notification.user_id == user.id,
                                Notification.type == NotificationType.GOAL_MILESTONE.value,
                                Notification.created_at >= three_days_ago,
                            )
                        )
                        has_recent_dl_alert = any(
                            n.data and n.data.get("goal_id") == str(goal.id) and "deadline_alert" in n.data
                            for n in existing_dl.scalars().all()
                        )

                        if not has_recent_dl_alert:
                            notif = Notification(
                                user_id=user.id,
                                title=f"⏳ Goal Target Approaching: {goal.name}",
                                message=f"Goal '{goal.name}' target date is in {days_remaining} day(s). You are currently at {pct:.0f}% of your target.",
                                type=NotificationType.GOAL_MILESTONE.value,
                                data={
                                    "goal_id": str(goal.id),
                                    "goal_name": goal.name,
                                    "deadline_alert": True,
                                    "days_remaining": days_remaining,
                                    "current_amount": current,
                                    "target_amount": target,
                                },
                            )
                            session.add(notif)
                            notifications_sent += 1

            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"[Job: GoalChecks] Error checking goals for user {user.id}: {e}", exc_info=True)

    logger.info(f"[Job: GoalChecks] Completed. Evaluated {total_checked} goals, sent {notifications_sent} notifications.")
    return {
        "job": "goal_checks",
        "goals_evaluated": total_checked,
        "notifications_sent": notifications_sent,
        "messages": messages,
    }
