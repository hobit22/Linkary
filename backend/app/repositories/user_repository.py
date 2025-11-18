"""Repository for user database operations."""

from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import USERS_COLLECTION


class UserRepository:
    """Repository for user CRUD operations."""

    def __init__(self, database: AsyncIOMotorDatabase):
        """
        Initialize the repository.

        Args:
            database: MongoDB database instance
        """
        self.db = database
        self.collection = self.db[USERS_COLLECTION]

    async def find_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Find a user by email address.

        Args:
            email: User's email address

        Returns:
            User document or None if not found
        """
        return await self.collection.find_one({"email": email})

    async def find_by_google_id(self, google_id: str) -> Optional[Dict[str, Any]]:
        """
        Find a user by Google ID.

        Args:
            google_id: Google OAuth user ID

        Returns:
            User document or None if not found
        """
        return await self.collection.find_one({"google_id": google_id})

    async def find_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Find a user by their ObjectId.

        Args:
            user_id: User's ObjectId as string

        Returns:
            User document or None if not found
        """
        if not ObjectId.is_valid(user_id):
            return None
        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def create(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new user in the database.

        Args:
            user_data: User document data

        Returns:
            Created user document
        """
        result = await self.collection.insert_one(user_data)
        return await self.collection.find_one({"_id": result.inserted_id})

    async def update(
        self, user_id: str, update_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Update a user by their ObjectId.

        Args:
            user_id: User's ObjectId as string
            update_data: Fields to update

        Returns:
            Updated user document or None if not found
        """
        if not ObjectId.is_valid(user_id):
            return None

        update_data["updated_at"] = datetime.utcnow()
        await self.collection.update_one(
            {"_id": ObjectId(user_id)}, {"$set": update_data}
        )
        return await self.collection.find_one({"_id": ObjectId(user_id)})
