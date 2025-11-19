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
        tags: Optional[List[str]] = None,
        category: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        sort_by: str = "created_at_desc",
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Search and filter links with pagination.

        Args:
            user_id: User's ObjectId as string
            query: Optional search query for full-text search
            tags: Optional list of tags to filter (must match all)
            category: Optional category to filter by
            date_from: Optional start date for filtering
            date_to: Optional end date for filtering
            sort_by: Sort field and direction (created_at_desc, created_at_asc, title_asc, score)
            skip: Number of documents to skip (for pagination)
            limit: Maximum number of documents to return

        Returns:
            Tuple of (list of matching link documents, total count)
        """
        if not ObjectId.is_valid(user_id):
            return [], 0

        # Build the base query
        search_query: Dict[str, Any] = {"user_id": ObjectId(user_id)}

        # Add text search if query provided
        if query:
            search_query["$text"] = {"$search": query}

        # Filter by tags (must match all provided tags)
        if tags:
            search_query["tags"] = {"$all": tags}

        # Filter by category
        if category:
            search_query["category"] = category

        # Filter by date range
        if date_from or date_to:
            date_filter: Dict[str, Any] = {}
            if date_from:
                date_filter["$gte"] = date_from
            if date_to:
                date_filter["$lte"] = date_to
            if date_filter:
                search_query["created_at"] = date_filter

        # Determine sort criteria and projection
        projection: Optional[Dict[str, Any]] = None
        use_text_score = sort_by == "score" and query

        print("search_query",     search_query)

        if use_text_score:
            # Add text score to projection for sorting
            projection = {"score": {"$meta": "textScore"}}

        # Get total count for pagination
        total_count = await self.collection.count_documents(search_query)

        # Build the query cursor
        cursor = self.collection.find(search_query, projection)

        # Apply sorting
        if sort_by == "created_at_desc":
            cursor = cursor.sort("created_at", -1)
        elif sort_by == "created_at_asc":
            cursor = cursor.sort("created_at", 1)
        elif sort_by == "title_asc":
            cursor = cursor.sort("title", 1)
        elif sort_by == "title_desc":
            cursor = cursor.sort("title", -1)
        elif use_text_score:
            # Sort by text search score (descending)
            cursor = cursor.sort([("score", {"$meta": "textScore"})])
        else:
            # Default fallback
            cursor = cursor.sort("created_at", -1)

        # Apply pagination
        cursor = cursor.skip(skip).limit(limit)

        # Execute query and collect results
        results = []
        async for doc in cursor:
            # Remove the score field from results if it exists
            if "score" in doc:
                del doc["score"]
            results.append(doc)

        return results, total_count
