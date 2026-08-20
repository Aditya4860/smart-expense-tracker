import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock

from main import app

@pytest.mark.asyncio
async def test_google_login_redirect():
    # Because we're not starting a full server with SessionMiddleware in tests
    # easily in this simplified setup, we can mock the Google OAuth authorization redirect.
    with patch("authlib.integrations.starlette_client.apps.StarletteOAuth2App.authorize_redirect") as mock_auth, \
         patch("app.api.v1.oauth.settings.GOOGLE_CLIENT_ID", "mock_id"), \
         patch("app.api.v1.oauth.settings.GOOGLE_CLIENT_SECRET", "mock_secret"):
        mock_auth.return_value = {"status": "redirect"} # fake response
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/v1/oauth/google/login")
            
            assert response.status_code == 200 # Since we mocked it to return a dict
            assert mock_auth.called

@pytest.mark.asyncio
async def test_google_exchange_invalid():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/oauth/google/exchange", json={"code": "invalid"})
        assert response.status_code == 401
        
        # Wrapped response handling
        json_data = response.json()
        assert json_data["success"] is False
        assert "Invalid or expired authorization code" in json_data["message"]

@pytest.mark.asyncio
async def test_google_exchange_success():
    # We mock the exchange_code service method since we test the API layer
    with patch("app.services.oauth_service.OAuthService.exchange_code") as mock_exchange:
        mock_exchange.return_value = {
            "access_token": "mocked_access",
            "refresh_token": "mocked_refresh",
            "token_type": "bearer"
        }
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/v1/oauth/google/exchange", json={"code": "valid_mock_code"})
            
            assert response.status_code == 200
            
            json_data = response.json()
            assert json_data["success"] is True
            assert json_data["data"]["access_token"] == "mocked_access"
            assert json_data["data"]["refresh_token"] == "mocked_refresh"
