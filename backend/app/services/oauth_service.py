import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.models.oauth_code import OAuthCode
from app.core.exceptions import UnauthorizedException, BadRequestException
from app.services.auth_service import AuthService
from app.core.config import settings

class OAuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.auth_service = AuthService(db)

    async def get_or_create_google_user(self, google_id: str, email: str, name: str) -> User:
        clean_email = email.lower().strip()
        
        # 1. Check if user exists by google_id
        result = await self.db.execute(
            select(User).where(User.provider_id == google_id, User.auth_provider == "google")
        )
        user = result.scalars().first()
        if user:
            return user
            
        # 2. Check if user exists by email
        result = await self.db.execute(select(User).where(User.email == clean_email))
        user = result.scalars().first()
        
        if user:
            # If email exists, link it to Google.
            user.auth_provider = "google"
            user.provider_id = google_id
            await self.db.commit()
            await self.db.refresh(user)
            return user
            
        # 3. Create new user
        from app.schemas.user import UserCreate
        # Create with a dummy password since they will login with Google
        user_in = UserCreate(email=clean_email, password=secrets.token_urlsafe(32), full_name=name)
        user = await self.auth_service.register_user(user_in)
        
        # Update provider fields which register_user doesn't set by default
        user.auth_provider = "google"
        user.provider_id = google_id
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def generate_one_time_code(self, user_id: str) -> str:
        # Generate 64-char crypto random string
        raw_code = secrets.token_urlsafe(64)
        code_hash = hashlib.sha256(raw_code.encode()).hexdigest()
        
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
        
        oauth_code = OAuthCode(
            code_hash=code_hash,
            user_id=user_id,
            expires_at=expires_at,
            used=False
        )
        
        self.db.add(oauth_code)
        await self.db.commit()
        return raw_code

    async def exchange_code(self, raw_code: str) -> dict:
        code_hash = hashlib.sha256(raw_code.encode()).hexdigest()
        
        result = await self.db.execute(select(OAuthCode).where(OAuthCode.code_hash == code_hash))
        oauth_code = result.scalars().first()
        
        if not oauth_code:
            raise UnauthorizedException(detail="Invalid or expired authorization code.")
            
        if oauth_code.used:
            raise UnauthorizedException(detail="Authorization code has already been used.")
            
        # Timezone aware comparison
        now = datetime.now(timezone.utc)
        if oauth_code.expires_at.tzinfo is None:
            # If the database returns naive datetime for some reason, make it aware
            expires_at = oauth_code.expires_at.replace(tzinfo=timezone.utc)
        else:
            expires_at = oauth_code.expires_at

        if expires_at < now:
            raise UnauthorizedException(detail="Authorization code has expired.")
            
        # Mark as used
        oauth_code.used = True
        await self.db.commit()
        
        # Return JWT
        return self.auth_service.create_tokens(str(oauth_code.user_id))
