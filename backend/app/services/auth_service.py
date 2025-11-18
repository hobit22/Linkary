"""Business logic service for authentication operations."""

from datetime import datetime
from typing import Dict, Any
from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.config import get_settings
from app.core.security import create_access_token
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthResponse
from app.schemas.user import UserResponse
from app.utils.helpers import user_document_to_dict

settings = get_settings()


class AuthService:
    """Service layer for authentication business logic."""

    def __init__(self, user_repository: UserRepository):
        """
        Initialize the service.

        Args:
            user_repository: User repository instance
        """
        self.user_repository = user_repository

    async def verify_google_token(self, credential: str) -> Dict[str, Any]:
        """
        Verify Google OAuth token and extract user information.

        Args:
            credential: Google OAuth credential token

        Returns:
            Dictionary containing user info from Google

        Raises:
            ValueError: If token verification fails
        """
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                credential, requests.Request(), settings.GOOGLE_CLIENT_ID
            )

            # Verify the issuer
            if idinfo["iss"] not in [
                "accounts.google.com",
                "https://accounts.google.com",
            ]:
                raise ValueError("Invalid token issuer")

            # Extract user information
            return {
                "google_id": idinfo["sub"],
                "email": idinfo["email"],
                "name": idinfo.get("name", ""),
                "picture": idinfo.get("picture", ""),
            }
        except ValueError as e:
            raise ValueError(f"Token verification failed: {str(e)}")

    async def find_or_create_user(
        self, google_user_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Find existing user or create a new one based on Google user info.

        Args:
            google_user_info: User information from Google OAuth

        Returns:
            User document from database
        """
        # Try to find user by Google ID
        user = await self.user_repository.find_by_google_id(
            google_user_info["google_id"]
        )

        if user:
            # Update user information if it has changed
            update_data = {
                "name": google_user_info["name"],
                "picture": google_user_info["picture"],
            }
            user = await self.user_repository.update(str(user["_id"]), update_data)
            return user

        # Try to find user by email (in case they signed up differently)
        user = await self.user_repository.find_by_email(google_user_info["email"])

        if user:
            # Link Google ID to existing account
            update_data = {
                "google_id": google_user_info["google_id"],
                "name": google_user_info["name"],
                "picture": google_user_info["picture"],
            }
            user = await self.user_repository.update(str(user["_id"]), update_data)
            return user

        # Create new user
        user_data = {
            "email": google_user_info["email"],
            "name": google_user_info["name"],
            "picture": google_user_info["picture"],
            "google_id": google_user_info["google_id"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        return await self.user_repository.create(user_data)

    def generate_auth_response(self, user: Dict[str, Any]) -> AuthResponse:
        """
        Generate authentication response with JWT token and user data.

        Args:
            user: User document from database

        Returns:
            AuthResponse with access token and user information
        """
        # Create JWT token
        token_data = {"user_id": str(user["_id"]), "email": user["email"]}
        access_token = create_access_token(token_data)

        # Format user response
        user_response = user_document_to_dict(user)
        user_obj = UserResponse(**user_response)

        return AuthResponse(
            access_token=access_token, token_type="bearer", user=user_obj
        )
