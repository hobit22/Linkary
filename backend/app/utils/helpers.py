"""Helper functions for data transformation and utilities."""

from datetime import datetime
from typing import Dict, Any


def link_document_to_dict(link: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert MongoDB link document to API response format.

    Transforms snake_case fields to camelCase and converts ObjectIds to strings.

    Args:
        link: MongoDB document dictionary

    Returns:
        Dictionary formatted for API response
    """
    return {
        "_id": str(link["_id"]),
        "url": link["url"],
        "title": link.get("title", ""),
        "description": link.get("description", ""),
        "favicon": link.get("favicon", ""),
        "image": link.get("image", ""),
        "tags": link.get("tags", []),
        "category": link.get("category", "Other"),
        "relatedLinks": [str(rl) for rl in link.get("related_links", [])],
        "notes": link.get("notes", ""),
        "createdAt": link.get("created_at", datetime.utcnow()),
        "updatedAt": link.get("updated_at", datetime.utcnow()),
    }


def user_document_to_dict(user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert MongoDB user document to API response format.

    Transforms snake_case fields to camelCase and converts ObjectIds to strings.

    Args:
        user: MongoDB user document dictionary

    Returns:
        Dictionary formatted for API response
    """
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture", ""),
        "createdAt": user.get("created_at", datetime.utcnow()),
        "updatedAt": user.get("updated_at", datetime.utcnow()),
    }
