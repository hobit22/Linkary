"""Common schemas used across the API."""

from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

DataT = TypeVar("DataT")


class SuccessResponse(BaseModel, Generic[DataT]):
    """Standard success response wrapper."""

    success: bool = True
    data: DataT
    count: Optional[int] = None


class ErrorResponse(BaseModel):
    """Standard error response."""

    success: bool = False
    detail: str


class HealthCheckResponse(BaseModel):
    """Health check response."""

    success: bool
    message: str
    version: str
