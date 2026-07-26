from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.schemas.category_schema import CategoryCreate, CategoryUpdate, CategoryResponse
from app.repositories.category_repository import CategoryRepository
from app.services.category_service import CategoryService

router = APIRouter(tags=["Categories"])

def get_category_service(db: AsyncSession = Depends(get_db_session)) -> CategoryService:
    repository = CategoryRepository(db)
    return CategoryService(repository)

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """Create a new category."""
    return await service.create_category(str(current_user.id), category_in)

@router.get("", response_model=List[CategoryResponse])
async def list_categories(
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """List all categories (user-specific and system default)."""
    return await service.list_categories(str(current_user.id))

@router.get("/{id}", response_model=CategoryResponse)
async def get_category(
    id: str,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """Get a specific category by ID."""
    return await service.get_category(id, str(current_user.id))

@router.put("/{id}", response_model=CategoryResponse)
async def update_category(
    id: str,
    category_in: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """Update a user-specific category by ID."""
    return await service.update_category(id, str(current_user.id), category_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    id: str,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service)
):
    """Delete a user-specific category by ID."""
    await service.delete_category(id, str(current_user.id))
