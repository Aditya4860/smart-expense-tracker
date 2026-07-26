import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Fix import path ──────────────────────────────────────────────────────────
# env.py is at  <project_root>/alembic/env.py
# app/          is at  <project_root>/app/
# .parent.parent resolves to <project_root>/ regardless of cwd.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
# ─────────────────────────────────────────────────────────────────────────────

# Import application Base (pulls in all model metadata) and settings.
from app.core.database import Base  # noqa: E402
from app.core.config import settings  # noqa: E402

# Also import every model module so SQLAlchemy registers their tables into
# Base.metadata before autogenerate compares against the live database.
import app.models.user  # noqa: F401
import app.models.expense  # noqa: F401
import app.models.income  # noqa: F401
import app.models.budget  # noqa: F401
import app.models.goal  # noqa: F401
import app.models.category  # noqa: F401
import app.models.notification  # noqa: F401

config = context.config

# ── Prefer ALEMBIC_DATABASE_URL (sync psycopg driver).
# Falls back to DATABASE_URL with the asyncpg scheme replaced.
alembic_url = (
    str(settings.ALEMBIC_DATABASE_URL)
    if settings.ALEMBIC_DATABASE_URL
    else str(settings.DATABASE_URL).replace("+asyncpg", "+psycopg")
)
config.set_main_option("sqlalchemy.url", alembic_url.replace("%", "%%"))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Emit SQL to stdout without a live DB connection."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a live DB using a synchronous engine.

    Using a sync engine avoids the Windows ProactorEventLoop incompatibility
    that occurs when asyncpg tries to run inside asyncio.run().
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
