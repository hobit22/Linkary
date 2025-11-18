"""Authentication-related API schemas."""

from pydantic import BaseModel
from app.schemas.user import UserResponse


class GoogleTokenRequest(BaseModel):
    """Schema for Google OAuth token verification request."""

    credential: str


class AuthResponse(BaseModel):
    """Authentication response schema."""

    access_token: str
    token_type: str
    user: UserResponse

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    """JWT token payload schema."""

    user_id: str
    email: str

    class Config:
        from_attributes = True
