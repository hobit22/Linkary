"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl

from app.core.constants import CategoryEnum, DEFAULT_CATEGORY


class LinkBase(BaseModel):
    """Base Link schema."""

    url: str
    tags: Optional[List[str]] = []
    category: Optional[str] = DEFAULT_CATEGORY
    notes: Optional[str] = ""
    related_links: Optional[List[str]] = []


class LinkCreate(LinkBase):
    """Schema for creating a new link."""

    pass


class LinkUpdate(BaseModel):
    """Schema for updating a link."""

    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    related_links: Optional[List[str]] = None


class LinkResponse(BaseModel):
    """Schema for link response."""

    id: str = Field(alias="_id")
    url: str
    title: str
    description: str
    favicon: str
    image: str
    tags: List[str]
    category: str
    related_links: List[str] = Field(alias="relatedLinks")
    notes: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class GraphNode(BaseModel):
    """Schema for graph node."""

    id: str
    label: str
    url: str
    category: str
    tags: List[str]


class GraphEdge(BaseModel):
    """Schema for graph edge."""

    source: str
    target: str


class GraphData(BaseModel):
    """Schema for graph data."""

    nodes: List[GraphNode]
    edges: List[GraphEdge]
