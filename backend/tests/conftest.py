"""Pytest configuration and fixtures."""

import pytest
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import get_settings


@pytest.fixture
def client():
    """FastAPI test client fixture."""
    return TestClient(app)


@pytest.fixture
async def test_db():
    """Test database fixture."""
    settings = get_settings()
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client.get_database("linkary_test")

    yield db

    # Cleanup
    await client.drop_database("linkary_test")
    client.close()
