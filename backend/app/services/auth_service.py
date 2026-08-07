from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import BadRequestException, UnauthorizedException
from app.core.sanitization import sanitize_string

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        clean_email = email.lower().strip()
        result = await self.db.execute(select(User).where(User.email == clean_email))
        return result.scalars().first()

    async def register_user(self, user_in: UserCreate) -> User:
        clean_email = user_in.email.lower().strip()
        user = await self.get_user_by_email(clean_email)
        if user:
            raise BadRequestException(detail="Email already registered")
            
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            email=clean_email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            currency_preference=user_in.currency_preference or "USD"
        )
        try:
            self.db.add(db_user)
            await self.db.commit()
            await self.db.refresh(db_user)

            # Seed default categories
            from app.models.category import Category
            from app.constants.default_categories import DEFAULT_CATEGORIES
            
            for cat in DEFAULT_CATEGORIES:
                db_cat = Category(
                    user_id=db_user.id,
                    name=cat["name"],
                    type=cat["type"],
                    icon=cat["icon"],
                    color=cat["color"]
                )
                self.db.add(db_cat)
                
            await self.db.commit()
            return db_user
        except Exception as e:
            await self.db.rollback()
            raise e

    async def authenticate_user(self, email: str, password: str) -> User:
        clean_email = email.lower().strip()
        user = await self.get_user_by_email(clean_email)
        if not user:
            raise UnauthorizedException(detail="Incorrect email or password")
        if not verify_password(password, user.hashed_password):
            raise UnauthorizedException(detail="Incorrect email or password")
        if not user.is_active:
            raise UnauthorizedException(detail="Inactive user account")
        return user

    def create_tokens(self, user_id: str) -> dict:
        return {
            "access_token": create_access_token(subject=user_id),
            "refresh_token": create_refresh_token(subject=user_id),
            "token_type": "bearer"
        }

    async def refresh_access_token(self, refresh_token: str) -> dict:
        # Strictly decode and validate token type is 'refresh'
        payload = decode_token(refresh_token, expected_type="refresh")
        user_id: str = payload.get("sub")
            
        # Verify user still exists and is active
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user or not user.is_active:
            raise UnauthorizedException(detail="User not found or inactive")
            
        return self.create_tokens(user_id)
