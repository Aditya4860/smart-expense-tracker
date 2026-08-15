from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_current_user, get_current_admin_user, get_db_session
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current logged in user details."""
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_users_me(
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """Update current user's name and/or currency preference."""
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.currency_preference is not None:
        current_user.currency_preference = user_in.currency_preference
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/me/admin", response_model=UserResponse)
async def read_users_me_admin(current_user: User = Depends(get_current_admin_user)):
    """Test endpoint for Admin role."""
    return current_user
