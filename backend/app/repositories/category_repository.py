from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from app.models.category import Category
from app.schemas.category_schema import CategoryCreate, CategoryUpdate

class CategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_category(self, user_id: str, category_in: CategoryCreate) -> Category:
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

    async def list_categories(self, user_id: str) -> Sequence[Category]:
        # Return both user-specific and system default categories (user_id is null)
        result = await self.db.execute(
            select(Category)
            .where(or_(Category.user_id == user_id, Category.user_id == None))
            .order_by(Category.name.asc())
        )
        return result.scalars().all()

    async def update_category(self, category_id: str, user_id: str, category_in: CategoryUpdate) -> Optional[Category]:
        # Users can only update their own categories
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

    async def delete_category(self, category_id: str, user_id: str) -> bool:
        # Users can only delete their own categories
        result = await self.db.execute(
            select(Category).where(and_(Category.id == category_id, Category.user_id == user_id))
        )
        db_category = result.scalars().first()
        if not db_category:
            return False
            
        await self.db.delete(db_category)
        await self.db.commit()
        return True
