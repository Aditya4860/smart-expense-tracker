import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal
from main import lifespan, app

async def main():
    print("[*] Testing AsyncSessionLocal connection with PgBouncer prepared statement config...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT 1"))
        print("[+] Query 1 Result:", result.scalar())
        
        result2 = await session.execute(text("SELECT 2"))
        print("[+] Query 2 Result:", result2.scalar())

        result3 = await session.execute(text("SELECT email FROM users LIMIT 1"))
        user = result3.scalar()
        print("[+] Query 3 User:", user)

    print("[*] Testing full FastAPI lifespan startup & shutdown...")
    async with lifespan(app):
        print("[+] Lifespan startup completed successfully!")

    print("[SUCCESS] All checks passed!")

if __name__ == "__main__":
    asyncio.run(main())
