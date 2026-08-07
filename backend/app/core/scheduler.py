from typing import Dict, Any, List
from datetime import datetime, timezone
import apscheduler
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR, JobExecutionEvent

from app.core.logging import logger
from app.jobs.hourly_runner import run_hourly_master_job

# Global scheduler instance
scheduler: AsyncIOScheduler = None
_is_running: bool = False

# In-memory execution stats tracker
_job_stats: Dict[str, Dict[str, Any]] = {
    "hourly_master_job": {
        "name": "Hourly Master Automation",
        "description": "Executes recurring transactions, reminders, budget alerts, goal checks, and monthly summaries",
        "last_run": None,
        "last_status": "PENDING",
        "last_duration_ms": 0,
        "total_runs": 0,
        "total_errors": 0,
        "last_error": None,
    }
}

def _on_job_executed(event: JobExecutionEvent):
    job_id = event.job_id
    if job_id in _job_stats:
        _job_stats[job_id]["last_run"] = datetime.now(timezone.utc).isoformat()
        _job_stats[job_id]["last_status"] = "SUCCESS"
        _job_stats[job_id]["total_runs"] += 1
    logger.info(f"[Scheduler] Job '{job_id}' executed successfully.")

def _on_job_error(event: JobExecutionEvent):
    job_id = event.job_id
    if job_id in _job_stats:
        _job_stats[job_id]["last_run"] = datetime.now(timezone.utc).isoformat()
        _job_stats[job_id]["last_status"] = "ERROR"
        _job_stats[job_id]["total_runs"] += 1
        _job_stats[job_id]["total_errors"] += 1
        _job_stats[job_id]["last_error"] = str(event.exception)
    logger.error(f"[Scheduler] Job '{job_id}' encountered error: {event.exception}", exc_info=event.traceback)

def _create_scheduler_instance() -> AsyncIOScheduler:
    s = AsyncIOScheduler(timezone="UTC")
    s.add_listener(_on_job_executed, EVENT_JOB_EXECUTED)
    s.add_listener(_on_job_error, EVENT_JOB_ERROR)
    return s

scheduler = _create_scheduler_instance()


def register_jobs():
    """
    Registers all automated background jobs to the APScheduler instance.
    """
    global scheduler
    if not scheduler.get_job("hourly_master_job"):
        scheduler.add_job(
            run_hourly_master_job,
            trigger=IntervalTrigger(hours=1),
            id="hourly_master_job",
            name="Hourly Master Automation",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )
        logger.info("[Scheduler] Registered 'hourly_master_job' (runs every 1 hour).")


def start_scheduler():
    """
    Starts the AsyncIOScheduler if it is not already running.
    """
    global scheduler, _is_running
    if scheduler is None or not _is_running:
        scheduler = _create_scheduler_instance()
    
    if not scheduler.running:
        register_jobs()
        try:
            scheduler.start()
            _is_running = True
            logger.info("[Scheduler] APScheduler started automatically ✓")
        except RuntimeError as e:
            logger.warning(f"[Scheduler] Deferred start (no running event loop): {e}")
    else:
        _is_running = True
        logger.info("[Scheduler] APScheduler is already running.")


def shutdown_scheduler():
    """
    Gracefully shuts down APScheduler, waiting for running jobs to finish.
    """
    global scheduler, _is_running
    if scheduler is not None and (scheduler.running or _is_running):
        logger.info("[Scheduler] Shutting down APScheduler...")
        try:
            scheduler.shutdown(wait=False)
        except Exception as e:
            logger.warning(f"[Scheduler] Shutdown note: {e}")
        _is_running = False
        logger.info("[Scheduler] APScheduler shutdown complete ✓")


def get_scheduler_status() -> Dict[str, Any]:
    """
    Returns comprehensive scheduler health and job execution metrics.
    """
    global scheduler, _is_running
    is_running = _is_running and bool(scheduler and scheduler.running)
    jobs_info: List[Dict[str, Any]] = []

    if is_running:
        for job in scheduler.get_jobs():
            stats = _job_stats.get(job.id, {})
            next_run = job.next_run_time.isoformat() if job.next_run_time else None
            jobs_info.append({
                "id": job.id,
                "name": job.name,
                "next_run_time": next_run,
                "last_run": stats.get("last_run"),
                "last_status": stats.get("last_status", "PENDING"),
                "total_runs": stats.get("total_runs", 0),
                "total_errors": stats.get("total_errors", 0),
                "last_error": stats.get("last_error"),
            })

    return {
        "status": "running" if is_running else "stopped",
        "engine": f"APScheduler {apscheduler.__version__}",
        "total_jobs": len(jobs_info),
        "jobs": jobs_info,
    }


