from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db_session
from app.services.auth_service import AuthService
from app.schemas.auth import Token, LoginRequest, RefreshTokenRequest, ForgotPasswordRequest, VerifyEmailRequest
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db_session)
):
    """Register a new user."""
    auth_service = AuthService(db)
    return await auth_service.register_user(user_in)

@router.post("/login", response_model=Token)
async def login(
    login_in: LoginRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """Authenticate user and return JWT tokens."""
    auth_service = AuthService(db)
    user = await auth_service.authenticate_user(login_in.email, login_in.password)
    return auth_service.create_tokens(str(user.id))

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_in: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """Refresh access token using a valid refresh token."""
    auth_service = AuthService(db)
    return await auth_service.refresh_access_token(refresh_in.refresh_token)

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    """Logout user (Stateless - client should discard tokens)."""
    return {"message": "Successfully logged out. Please discard your tokens."}

@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(
    forgot_in: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """Initiate password reset flow (Placeholder)."""
    # Placeholder for actual implementation (e.g. sending email)
    return {"message": "If that email is registered, a password reset link has been sent."}

@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(
    verify_in: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """Verify user email (Placeholder)."""
    # Placeholder for actual implementation
    return {"message": "Email verified successfully."}
