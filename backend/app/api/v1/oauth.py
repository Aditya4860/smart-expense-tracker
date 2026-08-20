from fastapi import APIRouter, Depends, Request, status, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from authlib.integrations.starlette_client import OAuth, OAuthError
from app.core.dependencies import get_db_session
from app.core.config import settings
from app.services.oauth_service import OAuthService
from app.schemas.oauth_schema import OAuthExchangeRequest
from app.schemas.auth import Token
import urllib.parse

router = APIRouter()

oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

@router.get("/google/login")
async def google_login(request: Request):
    """Initiates the Google OAuth flow."""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured on the server."
        )
        
    redirect_uri = f"http://localhost:8000{settings.API_V1_STR}/oauth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db_session)):
    """Handles the callback from Google, retrieves user info, and redirects to frontend with a one-time code."""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")
            
        google_id = user_info.get("sub")
        email = user_info.get("email")
        name = user_info.get("name", email.split('@')[0])
        
        if not email:
            raise HTTPException(status_code=400, detail="Google account has no email associated.")
            
        oauth_service = OAuthService(db)
        user = await oauth_service.get_or_create_google_user(google_id, email, name)
        
        raw_code = await oauth_service.generate_one_time_code(str(user.id))
        
        # Redirect to frontend with the one-time code
        frontend_callback_url = f"{settings.FRONTEND_URL}/oauth/callback?code={raw_code}"
        return RedirectResponse(url=frontend_callback_url)
        
    except OAuthError as error:
        raise HTTPException(status_code=400, detail=f"OAuth Error: {error.error}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@router.post("/google/exchange", response_model=Token)
async def google_exchange(
    request_data: OAuthExchangeRequest,
    db: AsyncSession = Depends(get_db_session)
):
    """Exchanges the one-time code for the application's JWT."""
    oauth_service = OAuthService(db)
    tokens = await oauth_service.exchange_code(request_data.code)
    return tokens
