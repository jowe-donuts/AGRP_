"""Claims endpoints for item ownership verification workflow."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.dependencies import get_current_user, require_role
from app.db.models import Claim, Item, ItemStatus, Role, User
from app.db.session import get_session

router = APIRouter(prefix="/api/claims", tags=["claims"])


# -----------------------------------------------------------------------
# Pydantic schemas
# -----------------------------------------------------------------------
class ClaimCreate(BaseModel):
    """Request to submit a claim on an item."""

    item_id: int


class ClaimResponse(BaseModel):
    """Response for a claim."""

    id: int
    item_id: int
    claimant_id: int
    status: ItemStatus

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------
# Submit a claim
# -----------------------------------------------------------------------
@router.post(
    "/",
    response_model=ClaimResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a claim on a found/lost item",
)
def create_claim(
    claim_in: ClaimCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Submit a claim that the user believes an item belongs to them.

    The claim starts in CLAIMED status and awaits staff/admin verification.
    """
    # Verify item exists
    item = session.get(Item, claim_in.item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    # Check if user already claimed this item
    existing = session.exec(
        select(Claim).where(
            Claim.item_id == claim_in.item_id, Claim.claimant_id == current_user.id
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already claimed this item",
        )

    # Create claim
    claim = Claim(
        item_id=claim_in.item_id,
        claimant_id=current_user.id,
        status=ItemStatus.CLAIMED,
    )
    session.add(claim)
    session.commit()
    session.refresh(claim)

    return claim


# -----------------------------------------------------------------------
# Get a claim by ID
# -----------------------------------------------------------------------
@router.get(
    "/{claim_id}",
    response_model=ClaimResponse,
    summary="Get claim details",
)
def read_claim(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Retrieve a specific claim (user can only see their own, staff/admin can see all)."""
    claim = session.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")

    # RBAC: only the claimant or staff/admin can view
    if (
        current_user.id != claim.claimant_id
        and current_user.role not in [Role.STAFF, Role.ADMIN]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this claim"
        )

    return claim


# -----------------------------------------------------------------------
# List claims (staff/admin only)
# -----------------------------------------------------------------------
@router.get(
    "/",
    response_model=list[ClaimResponse],
    summary="List all claims (staff/admin only)",
)
def list_claims(
    status_filter: Optional[ItemStatus] = None,
    item_id: Optional[int] = None,
    current_user: User = Depends(require_role(Role.STAFF)),
    session: Session = Depends(get_session),
):
    """
    Retrieve all claims. Optionally filter by status or item_id.

    Only accessible to staff or admin.
    """
    stmt = select(Claim)

    if status_filter:
        stmt = stmt.where(Claim.status == status_filter)
    if item_id:
        stmt = stmt.where(Claim.item_id == item_id)

    return session.exec(stmt).all()


# -----------------------------------------------------------------------
# Approve a claim (staff/admin only)
# -----------------------------------------------------------------------
@router.patch(
    "/{claim_id}/approve",
    response_model=ClaimResponse,
    summary="Approve a claim and mark item as verified",
)
def approve_claim(
    claim_id: int,
    current_user: User = Depends(require_role(Role.STAFF)),
    session: Session = Depends(get_session),
):
    """
    Approve a claim after verification. Moves the claim (and item) to VERIFIED status.

    Only accessible to staff or admin.
    """
    claim = session.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")

    # Update claim status
    claim.status = ItemStatus.VERIFIED
    session.add(claim)

    # Update item status
    item = session.get(Item, claim.item_id)
    if item:
        item.status = ItemStatus.VERIFIED
        session.add(item)

    session.commit()
    session.refresh(claim)

    return claim


# -----------------------------------------------------------------------
# Reject a claim (staff/admin only)
# -----------------------------------------------------------------------
@router.patch(
    "/{claim_id}/reject",
    response_model=ClaimResponse,
    summary="Reject a claim",
)
def reject_claim(
    claim_id: int,
    current_user: User = Depends(require_role(Role.STAFF)),
    session: Session = Depends(get_session),
):
    """
    Reject a claim. The claim remains but is marked for rejection (you can add a reason field later).

    Only accessible to staff or admin.
    """
    claim = session.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")

    # For now, we just delete the claim. You could add a "rejected_at" field to track rejections.
    session.delete(claim)
    session.commit()

    return claim


# -----------------------------------------------------------------------
# Mark item as returned (staff/admin only)
# -----------------------------------------------------------------------
@router.patch(
    "/{claim_id}/return",
    response_model=ClaimResponse,
    summary="Mark claimed item as returned to owner",
)
def return_item(
    claim_id: int,
    current_user: User = Depends(require_role(Role.STAFF)),
    session: Session = Depends(get_session),
):
    """
    Mark an approved claim as RETURNED (i.e., the item was successfully returned to the owner).

    Only accessible to staff or admin.
    """
    claim = session.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")

    if claim.status != ItemStatus.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Claim must be verified before marking as returned",
        )

    # Update claim status
    claim.status = ItemStatus.RETURNED
    session.add(claim)

    # Update item status
    item = session.get(Item, claim.item_id)
    if item:
        item.status = ItemStatus.RETURNED
        session.add(item)

    session.commit()
    session.refresh(claim)

    return claim