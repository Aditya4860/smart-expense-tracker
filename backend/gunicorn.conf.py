"""
gunicorn.conf.py – Production Gunicorn configuration for Smart Expense Tracker.

Usage:
    gunicorn -c gunicorn.conf.py main:app

Environment variables respected:
    GUNICORN_WORKERS  – override worker count (default: 2×CPU+1, max 8)
    GUNICORN_BIND     – override bind address (default: 0.0.0.0:8000)
    GUNICORN_TIMEOUT  – worker timeout in seconds (default: 30)
    LOG_LEVEL         – logging level: debug|info|warning|error (default: info)
"""

import multiprocessing
import os

# ── Binding ────────────────────────────────────────────────────────────────────
bind = os.getenv("GUNICORN_BIND", "0.0.0.0:8000")

# ── Workers ────────────────────────────────────────────────────────────────────
# Use Uvicorn's async worker class for FastAPI / Starlette ASGI apps
worker_class = "uvicorn.workers.UvicornWorker"

# Recommended formula: (2 × CPU) + 1, capped at 8 for container environments
_cpu = multiprocessing.cpu_count()
_default_workers = min((2 * _cpu) + 1, 8)
workers = int(os.getenv("GUNICORN_WORKERS", _default_workers))

# Max simultaneous connections per worker (Uvicorn manages this internally)
worker_connections = 1000

# ── Timeouts ───────────────────────────────────────────────────────────────────
# Seconds to wait for the worker to finish before forceful kill
timeout = int(os.getenv("GUNICORN_TIMEOUT", 30))

# Seconds to wait for workers to finish outstanding requests during shutdown
graceful_timeout = int(os.getenv("GUNICORN_GRACEFUL_TIMEOUT", 30))

# Keep-alive connections timeout
keepalive = 5

# ── Performance ────────────────────────────────────────────────────────────────
# Pre-load app code before forking workers – saves memory via copy-on-write
preload_app = True

# Max requests per worker before restart (prevents memory leaks)
max_requests = 1000
max_requests_jitter = 100  # randomise restart to avoid thundering herd

# ── Logging ────────────────────────────────────────────────────────────────────
_log_level = os.getenv("LOG_LEVEL", "info").lower()
loglevel = _log_level
accesslog = "-"   # stdout
errorlog  = "-"   # stderr
access_log_format = (
    '{"time":"%(t)s","remote_addr":"%(h)s","method":"%(m)s",'
    '"path":"%(U)s","status":%(s)s,"duration_ms":%(M)s,'
    '"bytes_sent":%(b)s,"referer":"%(f)s","user_agent":"%(a)s"}'
)

# ── Process naming ─────────────────────────────────────────────────────────────
proc_name = "expense-tracker-api"

# ── Server mechanics ───────────────────────────────────────────────────────────
# Daemonize is intentionally False – let the container/OS manage the process
daemon = False

# ── Hooks ─────────────────────────────────────────────────────────────────────
def on_starting(server):
    server.log.info(
        f"Starting Gunicorn | workers={workers} | bind={bind} | "
        f"log_level={loglevel}"
    )

def worker_init(worker):
    worker.log.info(f"Worker {worker.pid} initialised")

def worker_exit(worker, server):
    worker.log.info(f"Worker {worker.pid} exiting gracefully")

def on_exit(server):
    server.log.info("Gunicorn server stopped cleanly")
