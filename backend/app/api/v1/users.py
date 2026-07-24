from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current logged in user details."""
    return current_user

@router.get("/me/admin", response_model=UserResponse)
async def read_users_me_admin(current_user: User = Depends(get_current_admin_user)):
    """Test endpoint for Admin role."""
    return current_user
