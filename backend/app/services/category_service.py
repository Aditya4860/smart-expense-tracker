from typing import Optional, Sequence
from app.models.category import Category
from app.schemas.category_schema import CategoryCreate, CategoryUpdate
from app.repositories.category_repository import CategoryRepository
from app.core.exceptions import NotFoundException

class CategoryService:
    def __init__(self, repository: CategoryRepository):
        self.repository = repository

    async def create_category(self, user_id: str, category_in: CategoryCreate) -> Category:
        return await self.repository.create_category(user_id, category_in)

    async def get_category(self, category_id: str, user_id: str) -> Category:
        category = await self.repository.get_category(category_id, user_id)
        if not category:
            raise NotFoundException("Category not found or you don't have access")
        return category

    async def list_categories(self, user_id: str) -> Sequence[Category]:
        return await self.repository.list_categories(user_id)

    async def update_category(self, category_id: str, user_id: str, category_in: CategoryUpdate) -> Category:
        category = await self.repository.update_category(category_id, user_id, category_in)
        if not category:
            raise NotFoundException("Category not found or you can't modify it")
        return category

    async def delete_category(self, category_id: str, user_id: str) -> bool:
        success = await self.repository.delete_category(category_id, user_id)
        if not success:
            raise NotFoundException("Category not found or you can't delete it")
        return success
