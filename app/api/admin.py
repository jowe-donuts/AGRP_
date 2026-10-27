"""Admin endpoints for system statistics and monitoring."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, func, select

from app.core.dependencies import require_role
from app.db.models import Claim, Item, ItemStatus, Match, Role, User
from app.db.session import get_session

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _paginate_query(
    stmt,
    session: Session,
    page: int,
    size: int,
    result_key: str,
):
    """
    Execute a paginated query and return formatted response.

    Args:
        stmt: SQLModel select statement (without offset/limit).
        session: SQLModel session.
        page: Page number (1-indexed).
        size: Items per page.
        result_key: Key name for results in response (e.g., "items", "claims").

    Returns:
        Dict with results, total, page, size, pages.
    """
    # Count total matching records before pagination.
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = session.exec(count_stmt).one()

    # Apply pagination and fetch results.
    paginated_stmt = stmt.offset((page - 1) * size).limit(size)
    results = session.exec(paginated_stmt).all()

    return {
        result_key: results,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size,
    }


@router.get(
    "/stats",
    summary="Get system statistics (admin only)",
)
def get_system_stats(
    current_user: User = Depends(require_role(Role.ADMIN)),
    session: Session = Depends(get_session),
):
    """
    Retrieve overall system statistics.
    
    Returns:
    - Total users
    - Total items (lost + found)
    - Total claims
    - Total successful matches
    - Items by status
    - Claims by status
    - Average match score
    """
    
    # Count users
    total_users = session.exec(select(func.count(User.id))).one()
    
    # Count items by status
    total_items = session.exec(select(func.count(Item.id))).one()
    lost_items = session.exec(select(func.count(Item.id)).where(Item.status == ItemStatus.LOST)).one()
    found_items = session.exec(select(func.count(Item.id)).where(Item.status == ItemStatus.FOUND)).one()
    claimed_items = session.exec(select(func.count(Item.id)).where(Item.status == ItemStatus.CLAIMED)).one()
    verified_items = session.exec(select(func.count(Item.id)).where(Item.status == ItemStatus.VERIFIED)).one()
    returned_items = session.exec(select(func.count(Item.id)).where(Item.status == ItemStatus.RETURNED)).one()
    
    # Count claims by status
    total_claims = session.exec(select(func.count(Claim.id))).one()
    claimed = session.exec(select(func.count(Claim.id)).where(Claim.status == ItemStatus.CLAIMED)).one()
    verified = session.exec(select(func.count(Claim.id)).where(Claim.status == ItemStatus.VERIFIED)).one()
    returned = session.exec(select(func.count(Claim.id)).where(Claim.status == ItemStatus.RETURNED)).one()
    
    # Count matches
    total_matches = session.exec(select(func.count(Match.id))).one()
    
    # Calculate average match score
    avg_match_score = session.exec(
        select(func.avg(Match.score)).where(Match.score > 0)
    ).one() or 0.0
    
    return {
        "users": {
            "total": total_users,
        },
        "items": {
            "total": total_items,
            "lost": lost_items,
            "found": found_items,
            "claimed": claimed_items,
            "verified": verified_items,
            "returned": returned_items,
        },
        "claims": {
            "total": total_claims,
            "claimed": claimed,
            "verified": verified,
            "returned": returned,
        },
        "matching": {
            "total_matches": total_matches,
            "average_match_score": round(avg_match_score, 2),
        },
    }


@router.get(
    "/items/status/{status}",
    summary="List items by status (admin only)",
)
def get_items_by_status(
    status: ItemStatus,
    page: int = 1,
    size: int = 50,
    current_user: User = Depends(require_role(Role.ADMIN)),
    session: Session = Depends(get_session),
):
    """Get all items with a specific status (paginated)."""
    stmt = select(Item).where(Item.status == status)
    return _paginate_query(stmt, session, page, size, "items")


@router.get(
    "/claims/pending",
    summary="List pending claims awaiting approval (admin only)",
)
def get_pending_claims(
    page: int = 1,
    size: int = 50,
    current_user: User = Depends(require_role(Role.ADMIN)),
    session: Session = Depends(get_session),
):
    """Get all claims in CLAIMED status (awaiting verification)."""
    stmt = select(Claim).where(Claim.status == ItemStatus.CLAIMED).order_by(Claim.created_at.asc())
    return _paginate_query(stmt, session, page, size, "claims")


@router.get(
    "/matches/top",
    summary="Get top matches by score (admin only)",
)
def get_top_matches(
    limit: int = 10,
    current_user: User = Depends(require_role(Role.ADMIN)),
    session: Session = Depends(get_session),
):
    """Get the highest-scoring matches."""
    stmt = select(Match).order_by(Match.score.desc()).limit(limit)
    matches = session.exec(stmt).all()
    
    return {
        "matches": matches,
        "count": len(matches),
    }
