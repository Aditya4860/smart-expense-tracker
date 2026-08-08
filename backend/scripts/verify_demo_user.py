import asyncio
import asyncpg
from app.core.config import settings
from app.core.security import verify_password

async def verify():
    dsn = str(settings.DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(dsn, statement_cache_size=0)
    try:
        user = await conn.fetchrow("SELECT id, email, hashed_password, full_name FROM users WHERE email = $1", "user1@gmail.com")
        if not user:
            print("[-] User not found!")
            return
        
        print(f"[+] User Found: {user['email']} (Name: {user['full_name']})")
        pw_ok = verify_password("user123", user["hashed_password"])
        print(f"[+] Password 'user123' verification: {'SUCCESS' if pw_ok else 'FAILED'}")

        # Summary of data
        uid = user["id"]
        incomes = await conn.fetchval("SELECT count(*) FROM incomes WHERE user_id = $1", uid)
        expenses = await conn.fetchval("SELECT count(*) FROM expenses WHERE user_id = $1", uid)
        budgets = await conn.fetchval("SELECT count(*) FROM budgets WHERE user_id = $1", uid)
        goals = await conn.fetchval("SELECT count(*) FROM goals WHERE user_id = $1", uid)
        recurring = await conn.fetchval("SELECT count(*) FROM recurring_transactions WHERE user_id = $1", uid)
        reminders = await conn.fetchval("SELECT count(*) FROM reminders WHERE user_id = $1", uid)
        notifs = await conn.fetchval("SELECT count(*) FROM notifications WHERE user_id = $1", uid)

        print("\n--- Summary of Seeded Data for user1@gmail.com ---")
        print(f"• Incomes:                {incomes}")
        print(f"• Expenses:               {expenses}")
        print(f"• Budgets:                {budgets}")
        print(f"• Savings Goals:          {goals}")
        print(f"• Recurring Transactions: {recurring}")
        print(f"• Reminders:              {reminders}")
        print(f"• Notifications:          {notifs}")
        print("-------------------------------------------------")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(verify())
