"""Health check endpoint."""

from fastapi import APIRouter

from app.schemas.common import HealthCheckResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint.

    Returns:
        Health status with version information
    """
    return HealthCheckResponse(
        success=True,
        message="Linkary API is running",
        version="2.0.0"
    )
