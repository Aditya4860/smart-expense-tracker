"""
logging_config.py – Centralised logging configuration.

- Development: coloured, human-readable console output
- Production:  structured JSON output (machine-parseable by log aggregators)

Usage:
    from app.core.logging_config import configure_logging
    configure_logging()   # call once at startup
"""

import logging
import sys
import json
import traceback
from datetime import datetime, timezone


class _JsonFormatter(logging.Formatter):
    """Emit each log record as a single-line JSON object."""

    LEVEL_MAP = {
        logging.DEBUG:    "DEBUG",
        logging.INFO:     "INFO",
        logging.WARNING:  "WARNING",
        logging.ERROR:    "ERROR",
        logging.CRITICAL: "CRITICAL",
    }

    def format(self, record: logging.LogRecord) -> str:
        log_obj: dict = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level":     self.LEVEL_MAP.get(record.levelno, record.levelname),
            "logger":    record.name,
            "message":   record.getMessage(),
        }

        # Attach exception info if present
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        # Attach any extra fields passed to the logger
        for key, value in record.__dict__.items():
            if key not in (
                "args", "asctime", "created", "exc_info", "exc_text",
                "filename", "funcName", "levelname", "levelno", "lineno",
                "message", "module", "msecs", "msg", "name", "pathname",
                "process", "processName", "relativeCreated", "stack_info",
                "thread", "threadName",
            ):
                log_obj[key] = value

        return json.dumps(log_obj, default=str)


class _ColourFormatter(logging.Formatter):
    """Coloured, human-readable formatter for local development."""

    COLOURS = {
        "DEBUG":    "\033[36m",   # cyan
        "INFO":     "\033[32m",   # green
        "WARNING":  "\033[33m",   # yellow
        "ERROR":    "\033[31m",   # red
        "CRITICAL": "\033[35m",   # magenta
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        colour = self.COLOURS.get(record.levelname, "")
        ts = datetime.now().strftime("%H:%M:%S")
        prefix = f"{colour}[{record.levelname:8s}]{self.RESET} {ts}"
        msg = record.getMessage()
        if record.exc_info:
            msg += "\n" + self.formatException(record.exc_info)
        return f"{prefix}  {msg}"


def configure_logging(level: str = "INFO", environment: str = "development") -> None:
    """
    Configure root logger and the 'app' logger.

    Args:
        level:       Log level string (DEBUG | INFO | WARNING | ERROR | CRITICAL).
        environment: 'production' → JSON formatter; anything else → colour formatter.
    """
    numeric_level = getattr(logging, level.upper(), logging.INFO)

    handler = logging.StreamHandler(sys.stdout)

    if environment == "production":
        handler.setFormatter(_JsonFormatter())
    else:
        handler.setFormatter(_ColourFormatter())

    handler.setLevel(numeric_level)

    # Configure root logger (catches everything from third-party libs too)
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)
    root_logger.handlers = []          # Remove any default handlers
    root_logger.addHandler(handler)

    # Suppress overly noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
