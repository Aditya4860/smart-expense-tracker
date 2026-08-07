import asyncio
import time
from typing import Dict, Any
from datetime import date, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import DBAPIError, OperationalError

from app.core.database import AsyncSessionLocal
from app.core.logging import logger
from app.jobs.recurring_jobs import run_recurring_transactions_job
from app.jobs.reminder_jobs import run_reminders_job
from app.jobs.budget_jobs import run_budget_checks_job
from app.jobs.goal_jobs import run_goal_checks_job
from app.jobs.summary_jobs import run_monthly_summaries_job

MAX_RETRIES = 3
INITIAL_BACKOFF_SECONDS = 2

async def execute_with_retry(job_func, *args, **kwargs) -> Any:
    """
    Executes an async background job with automatic retry and exponential backoff
    for transient database errors.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return await job_func(*args, **kwargs)
        except (OperationalError, DBAPIError, ConnectionError) as exc:
            if attempt == MAX_RETRIES:
                logger.error(
                    f"[Job Retry Exhausted] {job_func.__name__} failed after {MAX_RETRIES} attempts: {exc}",
                    exc_info=True,
                )
                raise
            backoff = INITIAL_BACKOFF_SECONDS * (2 ** (attempt - 1))
            logger.warning(
                f"[Job Retry {attempt}/{MAX_RETRIES}] {job_func.__name__} encountered transient error: {exc}. Retrying in {backoff}s..."
            )
            await asyncio.sleep(backoff)
        except Exception as exc:
            logger.error(f"[Job Unhandled Error] {job_func.__name__} failed with non-retryable error: {exc}", exc_info=True)
            raise


async def run_hourly_master_job(target_date: date = None) -> Dict[str, Any]:
    """
    Unified Hourly Master Background Job.
    Executes all scheduled responsibilities:
    1. Recurring income & expenses execution
    2. Due reminders processing & notification
    3. Budget threshold evaluation (80%, 90%, 100%)
    4. Savings goals progress & milestone checking
    5. Monthly summary generation (if on 1st of month)
    """
    start_time = time.time()
    effective_date = target_date or date.today()
    job_start_iso = datetime.now(timezone.utc).isoformat()

    logger.info(f"==================================================")
    logger.info(f"[Hourly Job Master] Triggered at {job_start_iso} for date: {effective_date}")
    logger.info(f"==================================================")

    results = {
        "status": "success",
        "started_at": job_start_iso,
        "target_date": effective_date.isoformat(),
        "components": {},
        "errors": [],
    }

    # 1. Recurring Transactions Job
    try:
        async with AsyncSessionLocal() as session:
            rec_res = await execute_with_retry(run_recurring_transactions_job, session, effective_date)
            results["components"]["recurring_transactions"] = rec_res
    except Exception as e:
        results["errors"].append({"job": "recurring_transactions", "error": str(e)})
        logger.error(f"[Hourly Job] Recurring transactions subjob failed: {e}", exc_info=True)

    # 2. Due Reminders Job
    try:
        async with AsyncSessionLocal() as session:
            rem_res = await execute_with_retry(run_reminders_job, session, effective_date)
            results["components"]["reminders"] = rem_res
    except Exception as e:
        results["errors"].append({"job": "reminders", "error": str(e)})
        logger.error(f"[Hourly Job] Reminders subjob failed: {e}", exc_info=True)

    # 3. Budget Checks Job
    try:
        async with AsyncSessionLocal() as session:
            bud_res = await execute_with_retry(run_budget_checks_job, session, effective_date)
            results["components"]["budget_checks"] = bud_res
    except Exception as e:
        results["errors"].append({"job": "budget_checks", "error": str(e)})
        logger.error(f"[Hourly Job] Budget checks subjob failed: {e}", exc_info=True)

    # 4. Goal Checks Job
    try:
        async with AsyncSessionLocal() as session:
            goal_res = await execute_with_retry(run_goal_checks_job, session, effective_date)
            results["components"]["goal_checks"] = goal_res
    except Exception as e:
        results["errors"].append({"job": "goal_checks", "error": str(e)})
        logger.error(f"[Hourly Job] Goal checks subjob failed: {e}", exc_info=True)

    # 5. Monthly Summaries Job (Runs on 1st of month, or during daily master cycle)
    if effective_date.day == 1 or target_date is not None:
        try:
            async with AsyncSessionLocal() as session:
                sum_res = await execute_with_retry(run_monthly_summaries_job, session, effective_date)
                results["components"]["monthly_summaries"] = sum_res
        except Exception as e:
            results["errors"].append({"job": "monthly_summaries", "error": str(e)})
            logger.error(f"[Hourly Job] Monthly summaries subjob failed: {e}", exc_info=True)

    elapsed = (time.time() - start_time) * 1000
    results["duration_ms"] = round(elapsed, 2)
    if results["errors"]:
        results["status"] = "partial_failure" if len(results["components"]) > 0 else "failed"

    logger.info(
        f"[Hourly Job Master] Finished in {elapsed:.2f}ms. Status: {results['status']}. "
        f"Components ran: {list(results['components'].keys())}. Errors: {len(results['errors'])}"
    )
    return results
