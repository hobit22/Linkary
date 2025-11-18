"""Authentication middleware for protected routes."""

from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.core.security import verify_token
from app.core.database import get_database
from app.repositories.user_repository import UserRepository

# HTTP Bearer token scheme
oauth2_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
) -> Dict[str, Any]:
    """
    Dependency to get the current authenticated user.

    Validates JWT token and retrieves user from database.

    Args:
        credentials: HTTP Bearer credentials

    Returns:
        User document from database

    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Verify token
        token = credentials.credentials
        token_data = verify_token(token)
    except JWTError:
        raise credentials_exception

    # Get user from database
    db = get_database()
    user_repository = UserRepository(db)
    user = await user_repository.find_by_id(token_data.user_id)

    if user is None:
        raise credentials_exception

    return user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> Optional[Dict[str, Any]]:
    """
    Dependency to optionally get the current authenticated user.

    Returns None if no valid token is provided.

    Args:
        credentials: Optional HTTP Bearer credentials

    Returns:
        User document from database or None
    """
    if credentials is None:
        return None

    try:
        # Verify token
        token = credentials.credentials
        token_data = verify_token(token)

        # Get user from database
        db = get_database()
        user_repository = UserRepository(db)
        user = await user_repository.find_by_id(token_data.user_id)

        return user
    except (JWTError, Exception):
        return None
