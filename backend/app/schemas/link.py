"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl, validator

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


class LinkSearchRequest(BaseModel):
    """Schema for link search request with filtering and pagination."""

    q: Optional[str] = Field(None, description="Search query string for full-text search")
    tags: Optional[List[str]] = Field(None, description="Filter by tags (must match all)")
    category: Optional[str] = Field(None, description="Filter by category")
    date_from: Optional[datetime] = Field(None, description="Filter by creation date (from)")
    date_to: Optional[datetime] = Field(None, description="Filter by creation date (to)")
    sort_by: Optional[str] = Field("created_at_desc", description="Sort field and direction")
    page: int = Field(1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(20, ge=1, le=100, description="Number of items per page")

    @validator("sort_by")
    def validate_sort_by(cls, v):
        """Validate sort_by field values."""
        allowed_values = ["created_at_desc", "created_at_asc", "title_asc", "title_desc", "score"]
        if v not in allowed_values:
            raise ValueError(f"sort_by must be one of: {', '.join(allowed_values)}")
        return v


class PaginatedLinkResponse(BaseModel):
    """Schema for paginated link response."""

    items: List[LinkResponse]
    total: int = Field(description="Total number of matching items")
    page: int = Field(description="Current page number")
    page_size: int = Field(description="Items per page")
    total_pages: int = Field(description="Total number of pages")

    @validator("total_pages", always=True)
    def calculate_total_pages(cls, v, values):
        """Calculate total pages from total and page_size."""
        if "total" in values and "page_size" in values:
            total = values["total"]
            page_size = values["page_size"]
            return (total + page_size - 1) // page_size if page_size > 0 else 0
        return v
