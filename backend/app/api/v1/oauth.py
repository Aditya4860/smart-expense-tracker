import secrets
import hashlib
import hmac
import time
import httpx

from fastapi import APIRouter, Depends, Request, status, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session
from app.core.config import settings
from app.services.oauth_service import OAuthService
from app.schemas.oauth_schema import OAuthExchangeRequest
from app.schemas.auth import Token

router = APIRouter()

# ── Google OIDC constants ─────────────────────────────────────────────────────
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
OAUTH_SCOPE = "openid email profile"
STATE_COOKIE = "oauth_state"
STATE_MAX_AGE = 600  # 10 minutes


def _sign_state(state: str) -> str:
    """Create an HMAC signature of the state using SECRET_KEY."""
    return hmac.new(
        settings.SECRET_KEY.encode(),
        state.encode(),
        hashlib.sha256
    ).hexdigest()


def _make_signed_state() -> tuple[str, str]:
    """Return (raw_state, signed_cookie_value)."""
    raw = secrets.token_urlsafe(32)
    sig = _sign_state(raw)
    # Cookie value: raw_state:signature:timestamp
    cookie_val = f"{raw}:{sig}:{int(time.time())}"
    return raw, cookie_val


def _verify_state_cookie(cookie_val: str, query_state: str) -> bool:
    """Validate state from cookie vs state returned by Google."""
    try:
        parts = cookie_val.split(":")
        if len(parts) != 3:
            return False
        raw, sig, ts = parts
        # Check timestamp (10 min max)
        if int(time.time()) - int(ts) > STATE_MAX_AGE:
            return False
        # Verify HMAC
        expected_sig = _sign_state(raw)
        if not hmac.compare_digest(sig, expected_sig):
            return False
        # Verify state matches
        return hmac.compare_digest(raw, query_state)
    except Exception:
        return False


@router.get("/google/login")
async def google_login(request: Request):
    """Initiates the Google OAuth flow using a signed state cookie (no server session required)."""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured on the server."
        )

    raw_state, cookie_val = _make_signed_state()
    redirect_uri = f"http://localhost:8000{settings.API_V1_STR}/oauth/google/callback"

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": OAUTH_SCOPE,
        "state": raw_state,
        "access_type": "online",
    }
    auth_url = GOOGLE_AUTH_URL + "?" + "&".join(f"{k}={v}" for k, v in params.items())

    response = RedirectResponse(url=auth_url)
    response.set_cookie(
        key=STATE_COOKIE,
        value=cookie_val,
        max_age=STATE_MAX_AGE,
        httponly=True,
        samesite="lax",
        secure=False,   # localhost is http
    )
    return response


@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db_session)):
    """Handles Google's callback: validates state, exchanges code, creates/fetches user, issues one-time code."""
    # ── 1. State validation ───────────────────────────────────────────────────
    cookie_val = request.cookies.get(STATE_COOKIE)
    query_state = request.query_params.get("state", "")
    query_code = request.query_params.get("code", "")

    if not cookie_val or not _verify_state_cookie(cookie_val, query_state):
        raise HTTPException(status_code=400, detail="OAuth state mismatch. Please try signing in again.")

    if not query_code:
        error = request.query_params.get("error", "unknown_error")
        raise HTTPException(status_code=400, detail=f"Google OAuth error: {error}")

    # ── 2. Exchange code for tokens ───────────────────────────────────────────
    redirect_uri = f"http://localhost:8000{settings.API_V1_STR}/oauth/google/callback"
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": query_code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
    if token_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange code with Google.")

    token_data = token_resp.json()
    access_token = token_data.get("access_token")

    # ── 3. Fetch user info ────────────────────────────────────────────────────
    async with httpx.AsyncClient() as client:
        userinfo_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if userinfo_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch user info from Google.")

    user_info = userinfo_resp.json()
    google_id = user_info.get("sub")
    email = user_info.get("email")
    name = user_info.get("name", email.split("@")[0] if email else "User")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email associated.")

    # ── 4. Get/create user and generate one-time code ─────────────────────────
    oauth_service = OAuthService(db)
    user = await oauth_service.get_or_create_google_user(google_id, email, name)
    raw_code = await oauth_service.generate_one_time_code(str(user.id))

    # ── 5. Clear state cookie and redirect to frontend ────────────────────────
    frontend_callback_url = f"{settings.FRONTEND_URL}/oauth/callback?code={raw_code}"
    response = RedirectResponse(url=frontend_callback_url)
    response.delete_cookie(STATE_COOKIE)
    return response


@router.post("/google/exchange", response_model=Token)
async def google_exchange(
    request_data: OAuthExchangeRequest,
    db: AsyncSession = Depends(get_db_session),
):
    """Exchanges the one-time code for the application's JWT."""
    oauth_service = OAuthService(db)
    tokens = await oauth_service.exchange_code(request_data.code)
    return tokens
