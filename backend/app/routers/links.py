from fastapi import APIRouter, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime

from app.database import get_database
from app.schemas.link import LinkCreate, LinkUpdate, LinkResponse, GraphData, GraphNode, GraphEdge
from app.services.metadata import metadata_extractor

router = APIRouter(prefix="/api/links", tags=["links"])


def link_helper(link) -> dict:
    """Convert MongoDB document to dict with proper field names"""
    return {
        "_id": str(link["_id"]),
        "url": link["url"],
        "title": link.get("title", ""),
        "description": link.get("description", ""),
        "favicon": link.get("favicon", ""),
        "image": link.get("image", ""),
        "tags": link.get("tags", []),
        "category": link.get("category", "Uncategorized"),
        "relatedLinks": [str(rl) for rl in link.get("related_links", [])],
        "notes": link.get("notes", ""),
        "createdAt": link.get("created_at", datetime.utcnow()),
        "updatedAt": link.get("updated_at", datetime.utcnow()),
    }


@router.get("", response_model=dict)
async def get_links():
    """Get all links"""
    db = get_database()
    links = []
    async for link in db.links.find():
        links.append(link_helper(link))

    return {
        "success": True,
        "count": len(links),
        "data": links
    }


@router.get("/graph", response_model=dict)
async def get_graph_data():
    """Get graph data for visualization"""
    db = get_database()
    links = []
    async for link in db.links.find():
        links.append(link)

    # Transform to graph structure
    nodes = [
        {
            "id": str(link["_id"]),
            "label": link.get("title", link["url"]),
            "url": link["url"],
            "category": link.get("category", "Uncategorized"),
            "tags": link.get("tags", [])
        }
        for link in links
    ]

    edges = []
    for link in links:
        for related_id in link.get("related_links", []):
            edges.append({
                "source": str(link["_id"]),
                "target": str(related_id)
            })

    return {
        "success": True,
        "data": {
            "nodes": nodes,
            "edges": edges
        }
    }


@router.get("/{link_id}", response_model=dict)
async def get_link(link_id: str):
    """Get a single link by ID"""
    db = get_database()

    if not ObjectId.is_valid(link_id):
        raise HTTPException(status_code=400, detail="Invalid link ID")

    link = await db.links.find_one({"_id": ObjectId(link_id)})

    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    return {
        "success": True,
        "data": link_helper(link)
    }


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_link(link: LinkCreate):
    """Create a new link"""
    db = get_database()

    # Check if link already exists
    existing = await db.links.find_one({"url": link.url})
    if existing:
        raise HTTPException(status_code=400, detail="Link already exists")

    # Extract metadata
    metadata = metadata_extractor.extract(link.url)

    # Prepare document
    link_doc = {
        "url": link.url,
        "title": metadata["title"],
        "description": metadata["description"],
        "favicon": metadata["favicon"],
        "image": metadata["image"],
        "tags": link.tags or [],
        "category": link.category or "Uncategorized",
        "notes": link.notes or "",
        "related_links": [ObjectId(rl) for rl in link.related_links] if link.related_links else [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db.links.insert_one(link_doc)
    created_link = await db.links.find_one({"_id": result.inserted_id})

    return {
        "success": True,
        "data": link_helper(created_link)
    }


@router.put("/{link_id}", response_model=dict)
async def update_link(link_id: str, link_update: LinkUpdate):
    """Update a link"""
    db = get_database()

    if not ObjectId.is_valid(link_id):
        raise HTTPException(status_code=400, detail="Invalid link ID")

    # Check if link exists
    existing = await db.links.find_one({"_id": ObjectId(link_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Link not found")

    # Prepare update data
    update_data = {k: v for k, v in link_update.model_dump(exclude_unset=True).items() if v is not None}

    # Convert related_links to ObjectIds
    if "related_links" in update_data:
        update_data["related_links"] = [ObjectId(rl) for rl in update_data["related_links"]]

    update_data["updated_at"] = datetime.utcnow()

    # Update document
    await db.links.update_one(
        {"_id": ObjectId(link_id)},
        {"$set": update_data}
    )

    updated_link = await db.links.find_one({"_id": ObjectId(link_id)})

    return {
        "success": True,
        "data": link_helper(updated_link)
    }


@router.delete("/{link_id}", response_model=dict)
async def delete_link(link_id: str):
    """Delete a link"""
    db = get_database()

    if not ObjectId.is_valid(link_id):
        raise HTTPException(status_code=400, detail="Invalid link ID")

    # Check if link exists
    existing = await db.links.find_one({"_id": ObjectId(link_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Link not found")

    await db.links.delete_one({"_id": ObjectId(link_id)})

    return {
        "success": True,
        "data": {}
    }
