"""Domain models for MongoDB documents."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId

from app.core.constants import DEFAULT_CATEGORY


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class LinkModel(BaseModel):
    """MongoDB Link document model."""

    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    url: str
    title: str = ""
    description: str = ""
    favicon: str = ""
    image: str = ""
    tags: List[str] = []
    category: str = DEFAULT_CATEGORY
    related_links: List[PyObjectId] = []
    notes: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
