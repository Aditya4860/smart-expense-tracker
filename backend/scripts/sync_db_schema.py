import asyncio
import asyncpg
from app.core.config import settings

async def sync_schema():
    print("[*] Connecting via asyncpg to execute DDL statements safely...")
    # Parse asyncpg DSN from DATABASE_URL
    dsn = str(settings.DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(dsn, statement_cache_size=0)
    
    try:
        # Create enums if not exist
        await conn.execute("""
        DO $$ BEGIN
            CREATE TYPE remindertype AS ENUM ('BILL', 'SUBSCRIPTION', 'EMI', 'SAVINGS', 'BUDGET', 'GOAL', 'CUSTOM');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
        """)

        await conn.execute("""
        DO $$ BEGIN
            CREATE TYPE reminderfrequency AS ENUM ('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
        """)

        await conn.execute("""
        DO $$ BEGIN
            CREATE TYPE reminderstatus AS ENUM ('PENDING', 'COMPLETED', 'SNOOZED', 'DISMISSED', 'CANCELLED');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
        """)

        await conn.execute("""
        DO $$ BEGIN
            CREATE TYPE recurringstatus AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
        """)

        # Alter recurring_transactions
        await conn.execute("ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS title VARCHAR(255);")
        await conn.execute("ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS description TEXT;")
        await conn.execute("ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS merchant VARCHAR(255);")
        await conn.execute("ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100);")
        await conn.execute("ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;")
        await conn.execute("ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS end_date DATE;")
        await conn.execute("ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS is_never_ending BOOLEAN DEFAULT TRUE;")
        await conn.execute("ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS last_processed_date DATE;")
        await conn.execute("ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';")
        await conn.execute("ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS auto_process BOOLEAN DEFAULT TRUE;")

        # Alter notifications
        await conn.execute("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'SYSTEM';")
        await conn.execute("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB;")

        # Alter goals
        await conn.execute("ALTER TABLE goals ADD COLUMN IF NOT EXISTS description TEXT;")
        await conn.execute("ALTER TABLE goals ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';")
        await conn.execute("ALTER TABLE goals ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';")

        # Create reminders table
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS reminders (
            id UUID PRIMARY KEY,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            amount NUMERIC(12, 2),
            type remindertype NOT NULL,
            frequency reminderfrequency NOT NULL DEFAULT 'ONCE',
            due_date DATE NOT NULL,
            due_time VARCHAR(10),
            status reminderstatus NOT NULL DEFAULT 'PENDING',
            is_auto_notified BOOLEAN NOT NULL DEFAULT TRUE,
            last_notified_at TIMESTAMP WITHOUT TIME ZONE,
            snooze_until DATE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            category_id UUID REFERENCES categories(id) ON DELETE SET NULL
        );
        """)

        # Create reminder_histories table
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS reminder_histories (
            id UUID PRIMARY KEY,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            action VARCHAR(50) NOT NULL,
            action_date DATE NOT NULL DEFAULT CURRENT_DATE,
            notes TEXT
        );
        """)

        # Indexes
        await conn.execute("CREATE INDEX IF NOT EXISTS ix_reminders_user_id ON reminders(user_id);")
        await conn.execute("CREATE INDEX IF NOT EXISTS ix_reminders_status ON reminders(status);")
        await conn.execute("CREATE INDEX IF NOT EXISTS ix_reminders_due_date ON reminders(due_date);")
        await conn.execute("CREATE INDEX IF NOT EXISTS ix_reminder_histories_user_id ON reminder_histories(user_id);")
        await conn.execute("CREATE INDEX IF NOT EXISTS ix_reminder_histories_reminder_id ON reminder_histories(reminder_id);")

        print("[+] PostgreSQL Schema synchronized successfully!")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(sync_schema())
