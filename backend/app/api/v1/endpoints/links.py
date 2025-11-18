"""Link management endpoints."""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Dict, Any

from app.core.database import get_database
from app.core.exceptions import (
    LinkNotFoundException,
    LinkAlreadyExistsException,
    InvalidObjectIdException,
    link_not_found_exception,
    link_already_exists_exception,
    invalid_object_id_exception,
)
from app.schemas.link import LinkCreate, LinkUpdate, GraphData
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
):
    """
    Get all links for the authenticated user.

    Requires authentication.

    Returns:
        List of all links with count
    """
    user_id = str(current_user["_id"])
    links = await service.get_all_links(user_id)
    formatted_links = [link_document_to_dict(link) for link in links]

    return {"success": True, "count": len(formatted_links), "data": formatted_links}


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
