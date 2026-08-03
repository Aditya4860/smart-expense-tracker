import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

from app.models.user import User
from app.models.category import Category
from app.models.enums import TransactionType
from app.core.config import settings

async def main():
    engine = create_async_engine(str(settings.DATABASE_URL))
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with async_session() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        
        for user in users:
            print(f"Checking categories for user {user.email}...")
            result = await db.execute(select(Category).where(Category.user_id == user.id))
            cats = result.scalars().all()
            if not cats:
                print(f"Seeding default categories for user {user.email}...")
                default_categories = [
                    {"name": "Food & Dining", "type": TransactionType.EXPENSE, "icon": "🍽️", "color": "text-orange-400"},
                    {"name": "Transport", "type": TransactionType.EXPENSE, "icon": "🚗", "color": "text-blue-400"},
                    {"name": "Shopping", "type": TransactionType.EXPENSE, "icon": "🛍️", "color": "text-pink-400"},
                    {"name": "Bills & Utilities", "type": TransactionType.EXPENSE, "icon": "⚡", "color": "text-yellow-400"},
                    {"name": "Entertainment", "type": TransactionType.EXPENSE, "icon": "🎬", "color": "text-purple-400"},
                    {"name": "Salary", "type": TransactionType.INCOME, "icon": "💼", "color": "text-green-400"},
                    {"name": "Freelancing", "type": TransactionType.INCOME, "icon": "💻", "color": "text-blue-400"},
                    {"name": "Investment", "type": TransactionType.INCOME, "icon": "📈", "color": "text-teal-400"},
                    {"name": "Other", "type": TransactionType.EXPENSE, "icon": "📦", "color": "text-slate-400"},
                    {"name": "Other", "type": TransactionType.INCOME, "icon": "📦", "color": "text-slate-400"}
                ]
                for cat in default_categories:
                    db_cat = Category(
                        user_id=user.id,
                        name=cat["name"],
                        type=cat["type"],
                        icon=cat["icon"],
                        color=cat["color"]
                    )
                    db.add(db_cat)
        
        await db.commit()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
