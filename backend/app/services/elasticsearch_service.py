"""Elasticsearch service for link indexing and searching."""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from elasticsearch import AsyncElasticsearch, NotFoundError

from app.core.elasticsearch import get_elasticsearch
from app.core.config import get_settings


class ElasticsearchService:
    """Service for Elasticsearch operations on links."""

    def __init__(self):
        """Initialize the Elasticsearch service."""
        self.settings = get_settings()
        self.index_name = self.settings.ELASTICSEARCH_INDEX

    def _get_client(self) -> Optional[AsyncElasticsearch]:
        """
        Get Elasticsearch client, returning None if not available.

        Returns:
            Elasticsearch client or None if unavailable
        """
        try:
            return get_elasticsearch()
        except RuntimeError:
            return None

    async def index_link(self, link: Dict[str, Any]) -> bool:
        """
        Index a link document in Elasticsearch.

        Args:
            link: Link document from MongoDB

        Returns:
            True if indexed successfully, False otherwise
        """
        es = self._get_client()
        if es is None:
            return False

        try:
            document = {
                "link_id": str(link["_id"]),
                "user_id": str(link["user_id"]),
                "url": link["url"],
                "title": link.get("title", ""),
                "description": link.get("description", ""),
                "notes": link.get("notes", ""),
                "tags": link.get("tags", []),
                "category": link.get("category", ""),
                "created_at": link.get("created_at", datetime.utcnow()).isoformat(),
                "updated_at": link.get("updated_at", datetime.utcnow()).isoformat(),
            }

            await es.index(
                index=self.index_name,
                id=str(link["_id"]),
                document=document,
                refresh=True,  # Make immediately searchable
            )
            return True
        except Exception as e:
            print(f"Error indexing link {link.get('_id')}: {e}")
            return False

    async def update_link(self, link_id: str, link: Dict[str, Any]) -> bool:
        """
        Update a link document in Elasticsearch.

        Args:
            link_id: Link ID
            link: Updated link document from MongoDB

        Returns:
            True if updated successfully, False otherwise
        """
        # Reindex the entire document
        return await self.index_link(link)

    async def delete_link(self, link_id: str) -> bool:
        """
        Delete a link document from Elasticsearch.

        Args:
            link_id: Link ID to delete

        Returns:
            True if deleted successfully, False otherwise
        """
        es = self._get_client()
        if es is None:
            return False

        try:
            await es.delete(
                index=self.index_name,
                id=link_id,
                refresh=True,
            )
            return True
        except NotFoundError:
            print(f"Link {link_id} not found in Elasticsearch")
            return False
        except Exception as e:
            print(f"Error deleting link {link_id}: {e}")
            return False

    async def search_links(
        self,
        user_id: str,
        query: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[str], int]:
        """
        Search links using Elasticsearch with Korean morphological analysis.

        Uses multi-match query across title, description, and notes fields.
        Supports both Korean (with nori analyzer) and English text.

        Args:
            user_id: User ID to filter by
            query: Search query string
            page: Page number (1-indexed)
            page_size: Number of results per page

        Returns:
            Tuple of (list of link IDs, total count)
        """
        es = self._get_client()
        if es is None:
            return [], 0

        try:
            # Calculate offset
            from_offset = (page - 1) * page_size

            # Build query
            must_conditions = [
                {"term": {"user_id": user_id}}
            ]

            if query:
                # Multi-match query across multiple fields with different weights
                must_conditions.append({
                    "multi_match": {
                        "query": query,
                        "fields": [
                            "title^3",           # Title with highest weight
                            "title.english^2.5", # English title with high weight
                            "description^2",     # Description with medium weight
                            "description.english^1.5",
                            "notes^1.5",         # Notes with medium weight
                            "notes.english^1",
                            "tags^2",            # Tags with medium weight
                        ],
                        "type": "best_fields",
                        "operator": "or",
                        "fuzziness": "AUTO",  # Handle typos
                        "prefix_length": 1,   # Require at least 1 char exact match
                    }
                })

            search_body = {
                "query": {
                    "bool": {
                        "must": must_conditions,
                    }
                },
                "from": from_offset,
                "size": page_size,
                "sort": [
                    "_score",
                    {"created_at": {"order": "desc"}},
                ],
                "_source": ["link_id"],  # Only return link IDs
            }

            # Execute search
            response = await es.search(
                index=self.index_name,
                body=search_body,
            )

            # Extract link IDs from results
            link_ids = [hit["_source"]["link_id"] for hit in response["hits"]["hits"]]
            total_count = response["hits"]["total"]["value"]

            return link_ids, total_count

        except Exception as e:
            print(f"Error searching links: {e}")
            return [], 0

    async def bulk_index_links(self, links: List[Dict[str, Any]]) -> int:
        """
        Bulk index multiple links.

        Args:
            links: List of link documents from MongoDB

        Returns:
            Number of successfully indexed documents
        """
        es = self._get_client()
        if es is None:
            return 0

        if not links:
            return 0

        try:
            from elasticsearch.helpers import async_bulk

            # Prepare bulk actions
            actions = []
            for link in links:
                document = {
                    "link_id": str(link["_id"]),
                    "user_id": str(link["user_id"]),
                    "url": link["url"],
                    "title": link.get("title", ""),
                    "description": link.get("description", ""),
                    "notes": link.get("notes", ""),
                    "tags": link.get("tags", []),
                    "category": link.get("category", ""),
                    "created_at": link.get("created_at", datetime.utcnow()).isoformat(),
                    "updated_at": link.get("updated_at", datetime.utcnow()).isoformat(),
                }

                actions.append({
                    "_index": self.index_name,
                    "_id": str(link["_id"]),
                    "_source": document,
                })

            # Execute bulk operation
            success, failed = await async_bulk(
                es,
                actions,
                refresh=True,
                raise_on_error=False,
            )

            if failed:
                print(f"Failed to index {len(failed)} documents")

            return success

        except Exception as e:
            print(f"Error in bulk indexing: {e}")
            return 0

    async def reindex_all_links(self, links: List[Dict[str, Any]]) -> int:
        """
        Reindex all links (useful for initial setup or recovery).

        Deletes existing index and creates a new one with all links.

        Args:
            links: List of all link documents from MongoDB

        Returns:
            Number of successfully indexed documents
        """
        es = self._get_client()
        if es is None:
            return 0

        try:
            # Delete existing index if it exists
            exists = await es.indices.exists(index=self.index_name)
            if exists:
                await es.indices.delete(index=self.index_name)
                print(f"Deleted existing index: {self.index_name}")

            # Recreate index with nori analyzer
            from app.core.elasticsearch import create_index_with_nori
            await create_index_with_nori()

            # Bulk index all links
            return await self.bulk_index_links(links)

        except Exception as e:
            print(f"Error reindexing links: {e}")
            return 0
