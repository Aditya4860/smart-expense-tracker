from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from app.models.category import Category
from app.schemas.category_schema import CategoryCreate, CategoryUpdate
from app.core.logging import logger

class CategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_category(self, user_id: str, category_in: CategoryCreate) -> Category:
        try:
            db_category = Category(
                user_id=user_id,
                name=category_in.name,
                type=category_in.type,
                icon=category_in.icon,
                color=category_in.color
            )
            self.db.add(db_category)
            await self.db.commit()
            await self.db.refresh(db_category)
            return db_category
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating category: {e}")
            raise

    async def get_category(self, category_id: str, user_id: str) -> Optional[Category]:
        result = await self.db.execute(
            select(Category).where(
                and_(
                    Category.id == category_id,
                    or_(Category.user_id == user_id, Category.user_id == None)
                )
            )
        )
        return result.scalars().first()

    async def list_categories(self, user_id: str, skip: int = 0, limit: int = 100) -> Sequence[Category]:
        result = await self.db.execute(
            select(Category)
            .where(or_(Category.user_id == user_id, Category.user_id == None))
            .order_by(Category.name.asc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def update_category(self, category_id: str, user_id: str, category_in: CategoryUpdate) -> Optional[Category]:
        try:
            result = await self.db.execute(
                select(Category).where(and_(Category.id == category_id, Category.user_id == user_id))
            )
            db_category = result.scalars().first()
            if not db_category:
                return None
                
            update_data = category_in.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_category, field, value)
                    
            await self.db.commit()
            await self.db.refresh(db_category)
            return db_category
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating category {category_id}: {e}")
            raise

    async def delete_category(self, category_id: str, user_id: str) -> bool:
        try:
            result = await self.db.execute(
                select(Category).where(and_(Category.id == category_id, Category.user_id == user_id))
            )
            db_category = result.scalars().first()
            if not db_category:
                return False
                
            await self.db.delete(db_category)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting category {category_id}: {e}")
            raise

    async def seed_default_presets(self, user_id: str) -> Sequence[Category]:
        from app.constants.default_categories import DEFAULT_CATEGORIES
        try:
            result = await self.db.execute(
                select(Category).where(Category.user_id == user_id)
            )
            existing = result.scalars().all()
            existing_keys = {(c.name.lower().strip(), c.type) for c in existing}

            added_any = False
            for cat in DEFAULT_CATEGORIES:
                if (cat["name"].lower().strip(), cat["type"]) not in existing_keys:
                    db_cat = Category(
                        user_id=user_id,
                        name=cat["name"],
                        type=cat["type"],
                        icon=cat["icon"],
                        color=cat["color"]
                    )
                    self.db.add(db_cat)
                    added_any = True

            if added_any:
                await self.db.commit()

            return await self.list_categories(user_id)
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error seeding default categories for user {user_id}: {e}")
            raise

