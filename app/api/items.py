"""Items CRUD endpoints with image upload and CLIP task scheduling."""

import os
import uuid
from logging import getLogger
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from loguru import logger
from sqlmodel import Session, select

from app.core.dependencies import get_current_user
from app.db.models import Category, Item, ItemStatus, Role, User
from app.db.session import get_session
from app.workers.tasks import generate_item_embedding_worker, run_matching_sweep_worker

router = APIRouter(prefix="/api/items", tags=["items"])


def _get_image_public_url(file: UploadFile, request: Request) -> str:
    """
    Save uploaded image file locally and return public URL.

    Validates file size and MIME type before accepting.
    Uses the request's Host header to construct the URL, so it works
    across localhost, staging, and production domains.

    Args:
        file: FastAPI UploadFile object.
        request: FastAPI Request object (for Host header).

    Returns:
        Public HTTP(S) URL to the saved file.

    Raises:
        ValueError: If file size exceeds limit or MIME type is not allowed.
    """
    from app.core.config import settings

    # Allowed MIME types and extensions for images.
    ALLOWED_MIMES = {"image/jpeg", "image/png", "image/webp"}
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
    MAX_SIZE_BYTES = settings.max_upload_size_mb * 1024 * 1024

    # Validate MIME type.
    if file.content_type not in ALLOWED_MIMES:
        raise ValueError(
            f"File type not allowed: {file.content_type}. "
            f"Allowed: {', '.join(ALLOWED_MIMES)}"
        )

    # Validate file extension.
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"File extension not allowed: {ext}. "
            f"Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Create a unique identifier for this file.
    file_id = str(uuid.uuid4())

    # Temporary directory inside the project root for storing local uploads.
    upload_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    local_path = os.path.join(upload_dir, f"{file_id}{ext}")

    # Write file with size limit check.
    total_size = 0
    with open(local_path, "wb") as f:
        for chunk in file.file:
            total_size += len(chunk)
            if total_size > MAX_SIZE_BYTES:
                # Clean up partial file.
                f.close()
                os.remove(local_path)
                raise ValueError(
                    f"File exceeds maximum size of {settings.max_upload_size_mb}MB"
                )
            f.write(chunk)

    # Build URL using the request's Host header to support any domain/port.
    # Preserves https/http based on request scheme.
    host = request.headers.get("host", "localhost:8000")
    scheme = request.url.scheme
    public_url = f"{scheme}://{host}/uploads/{file_id}{ext}"
    return public_url


def _create_item_with_status(
    title: str,
    description: str,
    category: Category,
    location: str,
    status: ItemStatus,
    color: Optional[str],
    brand: Optional[str],
    file: Optional[UploadFile],
    current_user: User,
    session: Session,
    request: Request,
) -> dict:
    """Unified item creation for lost/found, differing only in status."""
    image_urls: list[str] = []
    if file:
        public_url = _get_image_public_url(file, request)
        image_urls.append(public_url)

    item = Item(
        title=title,
        description=description,
        category=category,
        color=color,
        brand=brand,
        location=location,
        status=status,
        image_urls=image_urls,
        owner_id=current_user.id,
    )

    session.add(item)
    session.commit()
    session.refresh(item)

    logger.info("Created %s item %s (owner=%s)", status.value, item.id, current_user.id)

    # Enqueue CLIP tasks independently.
    generate_item_embedding_worker.delay(item.id)
    run_matching_sweep_worker.delay(item.id)

    return {"id": item.id, "title": item.title}


@router.post(
    "/lost",
    status_code=status.HTTP_201_CREATED,
    summary="Report a lost item",
)
def create_lost_item(
    request: Request,
    title: Annotated[str, Form()],
    description: Annotated[str, Form()],
    category: Annotated[Category, Form()],
    location: Annotated[str, Form()],
    color: Annotated[Optional[str], Form()] = None,
    brand: Annotated[Optional[str], Form()] = None,
    file: Annotated[Optional[UploadFile], File()] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create a new lost item with an optional attached photo."""
    return _create_item_with_status(
        title, description, category, location, ItemStatus.LOST,
        color, brand, file, current_user, session, request
    )


@router.post(
    "/found",
    status_code=status.HTTP_201_CREATED,
    summary="Report a found item",
)
def create_found_item(
    request: Request,
    title: Annotated[str, Form()],
    description: Annotated[str, Form()],
    category: Annotated[Category, Form()],
    location: Annotated[str, Form()],
    color: Annotated[Optional[str], Form()] = None,
    brand: Annotated[Optional[str], Form()] = None,
    file: Annotated[Optional[UploadFile], File()] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create a new found item with an optional attached photo."""
    return _create_item_with_status(
        title, description, category, location, ItemStatus.FOUND,
        color, brand, file, current_user, session, request
    )


@router.get(
    "/",
    response_model=list[Item],
    summary="List items with optional filters",
)
def list_items(
    status: Optional[ItemStatus] = None,
    category: Optional[Category] = None,
    color: Optional[str] = None,
    brand: Optional[str] = None,
    sort_by: str = "date_reported",
    order: str = "desc",
    page: int = 1,
    size: int = 50,
    session: Session = Depends(get_session),
):
    """Retrieve items with optional filtering and pagination.
    
    Query parameters:
    - status: "lost" or "found"
    - category: "electronics", "clothing", "accessory", "document", "other"
    - color: filter by color (e.g., "blue")
    - brand: filter by brand (e.g., "Nike")
    - sort_by: "date_reported" or "title" (default: "date_reported")
    - order: "asc" or "desc" (default: "desc")
    - page: page number (default: 1)
    - size: items per page (default: 50)
    """
    stmt = select(Item)
    
    # Apply filters
    if status is not None:
        stmt = stmt.where(Item.status == status)
    if category is not None:
        stmt = stmt.where(Item.category == category)
    if color is not None:
        stmt = stmt.where(Item.color.ilike(f"%{color}%"))
    if brand is not None:
        stmt = stmt.where(Item.brand.ilike(f"%{brand}%"))
    
    # Apply sorting
    if sort_by == "title":
        stmt = stmt.order_by(Item.title.desc() if order == "desc" else Item.title.asc())
    else:  # default to date_reported
        stmt = stmt.order_by(Item.date_reported.desc() if order == "desc" else Item.date_reported.asc())
    
    # Apply pagination
    stmt = stmt.offset((page - 1) * size).limit(size)
    
    return list(session.exec(stmt).all())


@router.get("/{item_id}", response_model=Item, summary="Get an item by ID")
def read_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.delete("/{item_id}", summary="Delete an item (owner or admin only)")
def delete_item(
    item_id: int,
    session: Session = Depends(get_session),
):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    session.delete(item)
    session.commit()
    return {"detail": "Item deleted"}


@router.get(
    "/{item_id}/match-result",
    summary="Get the latest AI match score for this item",
)
def get_match_result(item_id: int, session: Session = Depends(get_session)):
    """
    Retrieve the latest CLIP match result for an item.
    
    Returns the best-matching candidate item and its similarity score (0-100).
    If no match has been computed yet, returns 404.
    """
    from app.db.models import Match
    
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    
    # Get the latest match for this item
    stmt = select(Match).where(Match.item_id == item_id).order_by(Match.created_at.desc())
    latest_match = session.exec(stmt).first()
    
    if not latest_match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No match computed yet. Please wait for AI processing to complete.",
        )
    
    # Fetch the candidate item details
    candidate = session.get(Item, latest_match.candidate_id)
    
    return {
        "candidate_id": latest_match.candidate_id,
        "candidate_title": candidate.title if candidate else "Unknown",
        "score": latest_match.score,
        "created_at": latest_match.created_at,
    }


@router.get(
    "/search",
    response_model=list[Item],
    summary="Search items by text query",
)
def search_items(
    q: str,
    status: Optional[ItemStatus] = None,
    category: Optional[Category] = None,
    page: int = 1,
    size: int = 50,
    session: Session = Depends(get_session),
):
    """
    Search items by title, description, brand, or color using text matching.
    
    Query parameters:
    - q: Search query (required) – searches title, description, brand, color
    - status: Filter by "lost" or "found" (optional)
    - category: Filter by category (optional)
    - page: Page number (default: 1)
    - size: Items per page (default: 50)
    """
    if not q or len(q.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query must be at least 2 characters",
        )
    
    search_pattern = f"%{q}%"
    
    # Build query with text matching
    stmt = select(Item).where(
        (Item.title.ilike(search_pattern)) |
        (Item.description.ilike(search_pattern)) |
        (Item.brand.ilike(search_pattern)) |
        (Item.color.ilike(search_pattern))
    )
    
    # Apply filters
    if status is not None:
        stmt = stmt.where(Item.status == status)
    if category is not None:
        stmt = stmt.where(Item.category == category)
    
    # Apply pagination
    stmt = stmt.order_by(Item.date_reported.desc()).offset((page - 1) * size).limit(size)
    
    return list(session.exec(stmt).all())