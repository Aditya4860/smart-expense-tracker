from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.exceptions import BadRequestException, UnauthorizedException
from jose import jwt, JWTError
from app.core.config import settings

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def register_user(self, user_in: UserCreate) -> User:
        user = await self.get_user_by_email(user_in.email)
        if user:
            raise BadRequestException(detail="Email already registered")
            
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            currency_preference=user_in.currency_preference
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)

        # Seed default categories
        from app.models.category import Category
        from app.models.enums import TransactionType
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
                user_id=db_user.id,
                name=cat["name"],
                type=cat["type"],
                icon=cat["icon"],
                color=cat["color"]
            )
            self.db.add(db_cat)
            
        await self.db.commit()

        return db_user

    async def authenticate_user(self, email: str, password: str) -> User:
        user = await self.get_user_by_email(email)
        if not user:
            raise UnauthorizedException(detail="Incorrect email or password")
        if not verify_password(password, user.hashed_password):
            raise UnauthorizedException(detail="Incorrect email or password")
        if not user.is_active:
            raise UnauthorizedException(detail="Inactive user")
        return user

    def create_tokens(self, user_id: str) -> dict:
        return {
            "access_token": create_access_token(subject=user_id),
            "refresh_token": create_refresh_token(subject=user_id),
            "token_type": "bearer"
        }

    async def refresh_access_token(self, refresh_token: str) -> dict:
        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            token_type: str = payload.get("type")
            
            if user_id is None or token_type != "refresh":
                raise UnauthorizedException(detail="Invalid refresh token")
        except JWTError:
            raise UnauthorizedException(detail="Invalid refresh token")
            
        # Verify user still exists and is active
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user or not user.is_active:
            raise UnauthorizedException(detail="Invalid user")
            
        return self.create_tokens(user_id)
