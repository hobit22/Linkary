"""Link management endpoints."""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Dict, Any, Optional

from app.core.database import get_database
from app.core.exceptions import (
    LinkNotFoundException,
    LinkAlreadyExistsException,
    InvalidObjectIdException,
    link_not_found_exception,
    link_already_exists_exception,
    invalid_object_id_exception,
)
from app.schemas.link import LinkCreate, LinkUpdate
from app.services.link_service import LinkService
from app.repositories.link_repository import LinkRepository
from app.utils.helpers import link_document_to_dict
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/links", tags=["links"])


def get_link_service() -> LinkService:
    """
    Dependency injection for LinkService.

    Returns:
        Configured LinkService instance
    """
    db = get_database()
    repository = LinkRepository(db)
    return LinkService(repository)


@router.get("", response_model=dict)
async def get_links(
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: LinkService = Depends(get_link_service),
    q: Optional[str] = Query(None, description="Search query string"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    Get all links for the authenticated user with optional search.

    Supports simple search across title, description, notes, and url.
    Results are paginated and sorted by creation date (newest first).

    Requires authentication.

    Args:
        q: Search query across title, description, notes, and url
        page: Page number (1-indexed)
        page_size: Number of items per page (max 100)

    Returns:
        Paginated response with links, or simple list if no search query
    """
    user_id = str(current_user["_id"])

    # If no search query and page 1, maintain backward compatibility
    if not q and page == 1 and page_size == 20:
        links = await service.get_all_links(user_id)
        formatted_links = [link_document_to_dict(link) for link in links]
        return {"success": True, "count": len(formatted_links), "data": formatted_links}

    # Use search functionality
    results, total_count = await service.search_links(user_id, q, page, page_size)
    formatted_links = [link_document_to_dict(link) for link in results]

    # Calculate total pages
    total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 0

    return {
        "success": True,
        "data": {
            "items": formatted_links,
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        },
    }


@router.get("/graph", response_model=dict)
async def get_graph_data(
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: LinkService = Depends(get_link_service),
):
    """
    Get graph data for visualization.

    Must be defined before /{link_id} route to avoid path collision.
    Requires authentication.

    Returns:
        Graph data with nodes and edges
    """
    user_id = str(current_user["_id"])
    graph_data = await service.get_graph_data(user_id)

    return {"success": True, "data": graph_data.model_dump()}


@router.get("/{link_id}", response_model=dict)
async def get_link(
    link_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: LinkService = Depends(get_link_service),
):
    """
    Get a single link by ID.

    Requires authentication and ownership verification.

    Args:
        link_id: Link ID

    Returns:
        Link data

    Raises:
        HTTPException: 400 if invalid ID, 404 if not found
    """
    try:
        user_id = str(current_user["_id"])
        link = await service.get_link_by_id(link_id, user_id)
        return {"success": True, "data": link_document_to_dict(link)}
    except InvalidObjectIdException as e:
        raise invalid_object_id_exception(e.value)
    except LinkNotFoundException as e:
        raise link_not_found_exception(e.link_id)


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_link(
    link: LinkCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: LinkService = Depends(get_link_service),
):
    """
    Create a new link.

    Automatically extracts metadata from the URL.
    Requires authentication.

    Args:
        link: Link creation data

    Returns:
        Created link data

    Raises:
        HTTPException: 400 if link already exists
    """
    try:
        user_id = str(current_user["_id"])
        created_link = await service.create_link(link, user_id)
        return {"success": True, "data": link_document_to_dict(created_link)}
    except LinkAlreadyExistsException as e:
        raise link_already_exists_exception(e.url)


@router.put("/{link_id}", response_model=dict)
async def update_link(
    link_id: str,
    link_update: LinkUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: LinkService = Depends(get_link_service),
):
    """
    Update a link.

    Requires authentication and ownership verification.

    Args:
        link_id: Link ID
        link_update: Update data

    Returns:
        Updated link data

    Raises:
        HTTPException: 400 if invalid ID, 404 if not found
    """
    try:
        user_id = str(current_user["_id"])
        updated_link = await service.update_link(link_id, link_update, user_id)
        return {"success": True, "data": link_document_to_dict(updated_link)}
    except InvalidObjectIdException as e:
        raise invalid_object_id_exception(e.value)
    except LinkNotFoundException as e:
        raise link_not_found_exception(e.link_id)


@router.delete("/{link_id}", response_model=dict)
async def delete_link(
    link_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: LinkService = Depends(get_link_service),
):
    """
    Delete a link.

    Requires authentication and ownership verification.

    Args:
        link_id: Link ID

    Returns:
        Success confirmation

    Raises:
        HTTPException: 400 if invalid ID, 404 if not found
    """
    try:
        user_id = str(current_user["_id"])
        await service.delete_link(link_id, user_id)
        return {"success": True, "data": {}}
    except InvalidObjectIdException as e:
        raise invalid_object_id_exception(e.value)
    except LinkNotFoundException as e:
        raise link_not_found_exception(e.link_id)
