"""User domain model for MongoDB documents."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId

from app.models.link import PyObjectId


class UserModel(BaseModel):
    """MongoDB User document model."""

    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: EmailStr
    name: str
    picture: str = ""
    google_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
