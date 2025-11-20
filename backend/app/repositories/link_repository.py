"""Repository for link database operations."""

from typing import List, Optional, Dict, Any, Tuple
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import LINKS_COLLECTION


class LinkRepository:
    """Repository for link CRUD operations."""

    def __init__(self, database: AsyncIOMotorDatabase):
        """
        Initialize the repository.

        Args:
            database: MongoDB database instance
        """
        self.db = database
        self.collection = self.db[LINKS_COLLECTION]

    async def find_all(self) -> List[Dict[str, Any]]:
        """
        Retrieve all links from the database.

        Returns:
            List of link documents
        """
        links = []
        async for link in self.collection.find():
            links.append(link)
        return links

    async def find_by_user_id(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve all links for a specific user.

        Args:
            user_id: User's ObjectId as string

        Returns:
            List of link documents
        """
        if not ObjectId.is_valid(user_id):
            return []

        links = []
        async for link in self.collection.find({"user_id": ObjectId(user_id)}).sort("created_at", -1):
            links.append(link)
        return links

    async def find_by_id(self, link_id: ObjectId) -> Optional[Dict[str, Any]]:
        """
        Find a link by its ObjectId.

        Args:
            link_id: MongoDB ObjectId

        Returns:
            Link document or None if not found
        """
        return await self.collection.find_one({"_id": link_id})

    async def find_by_url(
        self, url: str, user_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Find a link by its URL, optionally filtering by user.

        Args:
            url: Link URL
            user_id: Optional user's ObjectId as string

        Returns:
            Link document or None if not found
        """
        query = {"url": url}
        if user_id and ObjectId.is_valid(user_id):
            query["user_id"] = ObjectId(user_id)
        return await self.collection.find_one(query)

    async def create(self, link_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new link in the database.

        Args:
            link_data: Link document data

        Returns:
            Created link document
        """
        result = await self.collection.insert_one(link_data)
        return await self.collection.find_one({"_id": result.inserted_id})

    async def update(
        self, link_id: ObjectId, update_data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Update a link by its ObjectId.

        Args:
            link_id: MongoDB ObjectId
            update_data: Fields to update

        Returns:
            Updated link document or None if not found
        """
        await self.collection.update_one(
            {"_id": link_id}, {"$set": update_data}
        )
        return await self.collection.find_one({"_id": link_id})

    async def delete(self, link_id: ObjectId) -> bool:
        """
        Delete a link by its ObjectId.

        Args:
            link_id: MongoDB ObjectId

        Returns:
            True if deleted, False if not found
        """
        result = await self.collection.delete_one({"_id": link_id})
        return result.deleted_count > 0

    async def exists_by_url(self, url: str, user_id: Optional[str] = None) -> bool:
        """
        Check if a link with the given URL exists, optionally filtering by user.

        Args:
            url: Link URL
            user_id: Optional user's ObjectId as string

        Returns:
            True if exists, False otherwise
        """
        query = {"url": url}
        if user_id and ObjectId.is_valid(user_id):
            query["user_id"] = ObjectId(user_id)
        count = await self.collection.count_documents(query)
        return count > 0

    async def search(
        self,
        user_id: str,
        query: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Search links with pagination.

        Args:
            user_id: User's ObjectId as string
            query: Optional search query (regex search across title, description, notes, and url)
            skip: Number of documents to skip (for pagination)
            limit: Maximum number of documents to return

        Returns:
            Tuple of (list of matching link documents, total count)
        """
        if not ObjectId.is_valid(user_id):
            return [], 0

        # Build the base query
        search_query: Dict[str, Any] = {"user_id": ObjectId(user_id)}

        # Add regex search if query provided (searches across title, description, notes, and url)
        if query:
            regex_pattern = {"$regex": query, "$options": "i"}  # case-insensitive
            search_query["$or"] = [
                {"title": regex_pattern},
                {"description": regex_pattern},
                {"notes": regex_pattern},
                {"url": regex_pattern},
            ]

        # Get total count for pagination
        total_count = await self.collection.count_documents(search_query)

        # Build the query cursor with sorting (newest first)
        cursor = self.collection.find(search_query).sort("created_at", -1)

        # Apply pagination
        cursor = cursor.skip(skip).limit(limit)

        # Execute query and collect results
        results = []
        async for doc in cursor:
            results.append(doc)

        return results, total_count
