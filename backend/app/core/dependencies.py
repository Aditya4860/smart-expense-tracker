from typing import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.core.exceptions import UnauthorizedException, ForbiddenException
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.core.security import decode_token
from app.models.user import User
from app.models.enums import Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db_session)
) -> User:
    # Strictly validate access token type and signature
    payload = decode_token(token, expected_type="access")
    user_id: str = payload.get("sub")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if user is None:
        raise UnauthorizedException(detail="User not found or account removed")
        
    if not user.is_active:
        raise ForbiddenException(detail="Inactive user account")
        
    return user

async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != Role.ADMIN:
        raise ForbiddenException(detail="Not enough privileges")
    return current_user
