import pytest
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate
from app.models.user import User
from app.core.exceptions import BadRequestException, UnauthorizedException
from app.core.security import get_password_hash, create_access_token, create_refresh_token


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.commit = AsyncMock()
    db.rollback = AsyncMock()
    db.refresh = AsyncMock()
    db.add = MagicMock()
    return db


@pytest.fixture
def auth_service(mock_db):
    return AuthService(db=mock_db)


@pytest.mark.asyncio
async def test_register_user_success(auth_service, mock_db):
    # Setup mock to return no existing user
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = None
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    user_in = UserCreate(
        email="newuser@example.com",
        password="SecurePassword123!",
        full_name="New User",
        currency_preference="USD"
    )

    user = await auth_service.register_user(user_in)
    assert user.email == "newuser@example.com"
    assert user.full_name == "New User"
    assert user.currency_preference == "USD"
    assert mock_db.add.called
    assert mock_db.commit.called


@pytest.mark.asyncio
async def test_register_user_duplicate_email(auth_service, mock_db):
    existing_user = User(
        id=uuid4(),
        email="existing@example.com",
        hashed_password="hash",
        full_name="Existing User"
    )
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = existing_user
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    user_in = UserCreate(
        email="existing@example.com",
        password="SecurePassword123!",
        full_name="Duplicate"
    )

    with pytest.raises(BadRequestException) as exc_info:
        await auth_service.register_user(user_in)
    assert "already registered" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_authenticate_user_success(auth_service, mock_db):
    password = "CorrectPassword123!"
    hashed = get_password_hash(password)
    user = User(
        id=uuid4(),
        email="user@example.com",
        hashed_password=hashed,
        full_name="Test User",
        is_active=True
    )
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = user
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    auth_user = await auth_service.authenticate_user("user@example.com", password)
    assert auth_user.id == user.id
    assert auth_user.email == "user@example.com"


@pytest.mark.asyncio
async def test_authenticate_user_wrong_password(auth_service, mock_db):
    hashed = get_password_hash("CorrectPassword123!")
    user = User(
        id=uuid4(),
        email="user@example.com",
        hashed_password=hashed,
        full_name="Test User",
        is_active=True
    )
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = user
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    with pytest.raises(UnauthorizedException) as exc_info:
        await auth_service.authenticate_user("user@example.com", "WrongPassword123!")
    assert "Incorrect email or password" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_authenticate_user_not_found(auth_service, mock_db):
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = None
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    with pytest.raises(UnauthorizedException) as exc_info:
        await auth_service.authenticate_user("nonexistent@example.com", "SomePassword123!")
    assert "Incorrect email or password" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_authenticate_user_inactive(auth_service, mock_db):
    password = "CorrectPassword123!"
    hashed = get_password_hash(password)
    user = User(
        id=uuid4(),
        email="inactive@example.com",
        hashed_password=hashed,
        full_name="Inactive User",
        is_active=False
    )
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = user
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    with pytest.raises(UnauthorizedException) as exc_info:
        await auth_service.authenticate_user("inactive@example.com", password)
    assert "Inactive user account" in str(exc_info.value.detail)


def test_create_tokens_structure(auth_service):
    user_id = str(uuid4())
    tokens = auth_service.create_tokens(user_id)
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"
    assert isinstance(tokens["access_token"], str)
    assert isinstance(tokens["refresh_token"], str)


@pytest.mark.asyncio
async def test_refresh_access_token_success(auth_service, mock_db):
    user_id = str(uuid4())
    user = User(id=uuid4(), email="user@example.com", is_active=True)
    
    exec_result = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.first.return_value = user
    exec_result.scalars.return_value = scalars_mock
    mock_db.execute.return_value = exec_result

    valid_refresh = create_refresh_token(subject=user_id)
    new_tokens = await auth_service.refresh_access_token(valid_refresh)
    
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens


@pytest.mark.asyncio
async def test_refresh_with_access_token_fails(auth_service):
    user_id = str(uuid4())
    access_tok = create_access_token(subject=user_id)

    with pytest.raises(UnauthorizedException) as exc_info:
        await auth_service.refresh_access_token(access_tok)
    assert "Invalid token type" in str(exc_info.value.detail)
