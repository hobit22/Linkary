"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.v1.endpoints import links, health, auth

# Create API v1 router
api_v1_router = APIRouter()

# Include all v1 endpoints
api_v1_router.include_router(auth.router)
api_v1_router.include_router(links.router)
api_v1_router.include_router(health.router)
