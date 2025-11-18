"""Authentication endpoints."""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any

from app.core.database import get_database
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.schemas.auth import GoogleTokenRequest, AuthResponse
from app.middleware.auth import get_current_user
from app.utils.helpers import user_document_to_dict

router = APIRouter(prefix="/api/auth", tags=["authentication"])


def get_auth_service() -> AuthService:
    """
    Dependency injection for AuthService.

    Returns:
        Configured AuthService instance
    """
    db = get_database()
    user_repository = UserRepository(db)
    return AuthService(user_repository)


@router.post("/google", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def google_auth(
    token_request: GoogleTokenRequest, service: AuthService = Depends(get_auth_service)
):
    """
    Authenticate with Google OAuth.

    Verifies Google OAuth token, creates or updates user, and returns JWT.

    Args:
        token_request: Google OAuth credential token
        service: Auth service instance

    Returns:
        AuthResponse with JWT token and user information

    Raises:
        HTTPException: 401 if token verification fails
    """
    try:
        # Verify Google token and extract user info
        google_user_info = await service.verify_google_token(token_request.credential)

        # Find or create user
        user = await service.find_or_create_user(google_user_info)

        # Generate JWT and response
        auth_response = service.generate_auth_response(user)

        return auth_response

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}",
        )


@router.get("/me", response_model=dict)
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get current authenticated user information.

    Requires valid JWT token in Authorization header.

    Args:
        current_user: Current authenticated user from dependency

    Returns:
        User information
    """
    user_data = user_document_to_dict(current_user)

    return {"success": True, "data": user_data}
