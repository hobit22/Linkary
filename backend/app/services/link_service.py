"""Business logic service for link operations."""

from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from bson import ObjectId

from app.repositories.link_repository import LinkRepository
from app.services.metadata import metadata_extractor
from app.schemas.link import LinkCreate, LinkUpdate, GraphData, GraphNode, GraphEdge
from app.core.exceptions import (
    LinkNotFoundException,
    LinkAlreadyExistsException,
    InvalidObjectIdException,
)
from app.core.constants import DEFAULT_CATEGORY


class LinkService:
    """Service layer for link business logic."""

    def __init__(self, repository: LinkRepository):
        """
        Initialize the service.

        Args:
            repository: Link repository instance
        """
        self.repository = repository

    async def get_all_links(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve all links for a specific user.

        Args:
            user_id: User's ObjectId as string

        Returns:
            List of link documents
        """
        return await self.repository.find_by_user_id(user_id)

    async def get_link_by_id(self, link_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get a single link by ID, verifying ownership.

        Args:
            link_id: Link ID string
            user_id: User's ObjectId as string

        Returns:
            Link document

        Raises:
            InvalidObjectIdException: If link_id is not a valid ObjectId
            LinkNotFoundException: If link is not found or doesn't belong to user
        """
        if not ObjectId.is_valid(link_id):
            raise InvalidObjectIdException(link_id)

        link = await self.repository.find_by_id(ObjectId(link_id))
        if not link:
            raise LinkNotFoundException(link_id)

        # Verify ownership
        if str(link["user_id"]) != user_id:
            raise LinkNotFoundException(link_id)

        return link

    async def create_link(
        self, link_data: LinkCreate, user_id: str
    ) -> Dict[str, Any]:
        """
        Create a new link with metadata extraction.

        Args:
            link_data: Link creation data
            user_id: User's ObjectId as string

        Returns:
            Created link document

        Raises:
            LinkAlreadyExistsException: If link with URL already exists for this user
        """
        # Check if link already exists for this user
        if await self.repository.exists_by_url(link_data.url, user_id):
            raise LinkAlreadyExistsException(link_data.url)

        # Extract metadata
        metadata = metadata_extractor.extract(link_data.url)

        # Prepare document
        link_doc = {
            "user_id": ObjectId(user_id),
            "url": link_data.url,
            "title": metadata["title"],
            "description": metadata["description"],
            "favicon": metadata["favicon"],
            "image": metadata["image"],
            "tags": link_data.tags or [],
            "category": link_data.category or DEFAULT_CATEGORY,
            "notes": link_data.notes or "",
            "related_links": [
                ObjectId(rl) for rl in link_data.related_links
            ] if link_data.related_links else [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        return await self.repository.create(link_doc)

    async def update_link(
        self, link_id: str, link_update: LinkUpdate, user_id: str
    ) -> Dict[str, Any]:
        """
        Update an existing link, verifying ownership.

        Args:
            link_id: Link ID string
            link_update: Update data
            user_id: User's ObjectId as string

        Returns:
            Updated link document

        Raises:
            InvalidObjectIdException: If link_id is not a valid ObjectId
            LinkNotFoundException: If link is not found or doesn't belong to user
        """
        if not ObjectId.is_valid(link_id):
            raise InvalidObjectIdException(link_id)

        # Check if link exists and verify ownership
        existing = await self.repository.find_by_id(ObjectId(link_id))
        if not existing:
            raise LinkNotFoundException(link_id)

        if str(existing["user_id"]) != user_id:
            raise LinkNotFoundException(link_id)

        # Prepare update data
        update_data = {
            k: v
            for k, v in link_update.model_dump(exclude_unset=True).items()
            if v is not None
        }

        # Convert related_links to ObjectIds
        if "related_links" in update_data:
            update_data["related_links"] = [
                ObjectId(rl) for rl in update_data["related_links"]
            ]

        update_data["updated_at"] = datetime.utcnow()

        # Update document
        updated = await self.repository.update(ObjectId(link_id), update_data)
        if not updated:
            raise LinkNotFoundException(link_id)

        return updated

    async def delete_link(self, link_id: str, user_id: str) -> bool:
        """
        Delete a link, verifying ownership.

        Args:
            link_id: Link ID string
            user_id: User's ObjectId as string

        Returns:
            True if deleted successfully

        Raises:
            InvalidObjectIdException: If link_id is not a valid ObjectId
            LinkNotFoundException: If link is not found or doesn't belong to user
        """
        if not ObjectId.is_valid(link_id):
            raise InvalidObjectIdException(link_id)

        # Check if link exists and verify ownership
        existing = await self.repository.find_by_id(ObjectId(link_id))
        if not existing:
            raise LinkNotFoundException(link_id)

        if str(existing["user_id"]) != user_id:
            raise LinkNotFoundException(link_id)

        return await self.repository.delete(ObjectId(link_id))

    async def get_graph_data(self, user_id: str) -> GraphData:
        """
        Get graph visualization data for a specific user.

        Args:
            user_id: User's ObjectId as string

        Returns:
            GraphData with nodes and edges
        """
        links = await self.repository.find_by_user_id(user_id)

        # Transform to graph structure
        nodes = [
            GraphNode(
                id=str(link["_id"]),
                label=link.get("title", link["url"]),
                url=link["url"],
                category=link.get("category", DEFAULT_CATEGORY),
                tags=link.get("tags", []),
            )
            for link in links
        ]

        edges = []
        for link in links:
            for related_id in link.get("related_links", []):
                edges.append(
                    GraphEdge(
                        source=str(link["_id"]), target=str(related_id)
                    )
                )

        return GraphData(nodes=nodes, edges=edges)

    async def search_links(
        self, user_id: str, query: Optional[str], page: int, page_size: int
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Search links with pagination.

        Args:
            user_id: User's ObjectId as string
            query: Optional search query
            page: Page number (1-indexed)
            page_size: Number of items per page

        Returns:
            Tuple of (list of matching link documents, total count)
        """
        # Calculate skip value for pagination
        skip = (page - 1) * page_size

        # Call repository search method
        return await self.repository.search(
            user_id=user_id,
            query=query,
            skip=skip,
            limit=page_size,
        )
