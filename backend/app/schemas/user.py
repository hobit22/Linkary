"""User-related API schemas."""

from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    """User response schema for API."""

    id: str
    email: EmailStr
    name: str
    picture: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class UserInDB(BaseModel):
    """User schema for database operations."""

    email: EmailStr
    name: str
    picture: str
    google_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
