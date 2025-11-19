"""Database connection management."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import get_settings
from app.core.constants import LINKS_COLLECTION

settings = get_settings()

# MongoDB client instance
client: AsyncIOMotorClient = None
database: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    """
    Connect to MongoDB.

    Establishes connection and stores client and database instances globally.
    Creates necessary indexes for search and filtering.
    """
    global client, database
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    database = client.get_database()
    print(f"Connected to MongoDB at {settings.MONGODB_URI}")

    # Create indexes for search and filtering
    await create_indexes()


async def close_mongo_connection():
    """
    Close MongoDB connection.

    Properly closes the MongoDB client connection.
    """
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database() -> AsyncIOMotorDatabase:
    """
    Get database instance.

    Returns:
        MongoDB database instance
    """
    return database


async def create_indexes():
    """
    Create database indexes for search and filtering optimization.

    Creates the following indexes on the links collection:
    - Text index on title, description, notes with weighted search
    - Compound index on user_id + created_at (descending) for efficient user queries
    - Single field indexes on tags and category for filtering
    - Index on read_status for future filtering support
    """
    collection = database[LINKS_COLLECTION]

    # Text index for full-text search with weights
    # Higher weight means the field has more importance in search ranking
    # Using default_language="none" for multilingual support (Korean + English)
    await collection.create_index(
        [
            ("title", "text"),
            ("description", "text"),
            ("notes", "text")
        ],
        weights={
            "title": 3,
            "description": 2,
            "notes": 1
        },
        default_language="none",
        name="text_search_index"
    )

    # Compound index for user queries sorted by date
    await collection.create_index(
        [("user_id", 1), ("created_at", -1)],
        name="user_created_index"
    )

    # Single field indexes for filtering
    await collection.create_index("tags", name="tags_index")
    await collection.create_index("category", name="category_index")
    await collection.create_index("read_status", name="read_status_index")

    print(f"Created indexes on {LINKS_COLLECTION} collection")
