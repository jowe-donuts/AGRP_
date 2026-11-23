"""Claims endpoints for item ownership verification workflow."""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.items import _get_image_public_url
from app.core.dependencies import get_current_user, require_role
from app.db.models import Claim, Item, ItemStatus, Role, User
from app.db.session import get_session

router = APIRouter(prefix="/api/claims", tags=["claims"])


# -----------------------------------------------------------------------
# Shared claim state mutation helper
# -----------------------------------------------------------------------
def _update_claim_and_item(
    claim: Claim,
    new_claim_status: ItemStatus,
    new_item_status: ItemStatus,
    session: Session,
) -> Claim:
    """Update claim and associated item to new statuses, atomically."""
    claim.status = new_claim_status
    session.add(claim)

    item = session.get(Item, claim.item_id)
    if item:
        item.status = new_item_status
        session.add(item)

    session.commit()
    session.refresh(claim)
    return claim


class ClaimResponse(BaseModel):
    """Response for a claim."""

    id: int
    item_id: int
    claimant_id: int
    status: ItemStatus
    item_title: Optional[str] = None
    proof_image: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


def _claim_response(claim: Claim, session: Session, items: Optional[dict] = None) -> dict:
    item = (items or {}).get(claim.item_id) or session.get(Item, claim.item_id)
    return {
        "id": claim.id,
        "item_id": claim.item_id,
        "claimant_id": claim.claimant_id,
        "status": claim.status,
        "item_title": item.title if item else None,
        "proof_image": claim.proof_image,
        "created_at": claim.created_at.isoformat() if claim.created_at else None,
    }


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
    request: Request,
    item_id: Annotated[int, Form()],
    proof_image: Annotated[Optional[UploadFile], File()] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Submit a claim that the user believes an item belongs to them.

    Accepts multipart form data: ``item_id`` plus an optional ``proof_image``
    photo of the item, which the admin can compare against the posted image.

    The claim starts in CLAIMED status and awaits staff/admin verification.
    """
    # Verify item exists
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    # Terminal states can no longer be claimed
    if item.status in (ItemStatus.VERIFIED, ItemStatus.RETURNED):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This item is no longer available for claim.",
        )

    # A user can't claim the same item twice
    existing = session.exec(
        select(Claim).where(Claim.item_id == item_id, Claim.claimant_id == current_user.id)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already claimed this item",
        )

    # A pending claim by anyone else blocks a competing claim
    pending = session.exec(
        select(Claim).where(Claim.item_id == item_id, Claim.status == ItemStatus.CLAIMED)
    ).first()
    if pending:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A claim is already pending for this item.",
        )

    # Save optional proof image (same storage/validation as item uploads)
    proof_url = None
    if proof_image and proof_image.filename:
        try:
            proof_url = _get_image_public_url(proof_image, request)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    # Create claim
    claim = Claim(
        item_id=item_id,
        claimant_id=current_user.id,
        status=ItemStatus.CLAIMED,
        proof_image=proof_url,
    )
    session.add(claim)
    session.commit()
    session.refresh(claim)

    return _claim_response(claim, session)


# -----------------------------------------------------------------------
# Claim history for current user
# -----------------------------------------------------------------------
@router.get("/me", response_model=list[ClaimResponse], summary="List my claims")
def list_my_claims(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Retrieve the claim history for the current user.

    Returns all claims made by the user, ordered by most recent.
    """
    stmt = select(Claim).where(Claim.claimant_id == current_user.id).order_by(Claim.created_at.desc())
    claims = list(session.exec(stmt).all())
    # Batch-fetch all referenced items in one query (avoids N+1 session.get per claim)
    item_ids = {c.item_id for c in claims}
    items = (
        {i.id: i for i in session.exec(select(Item).where(Item.id.in_(item_ids))).all()}
        if item_ids
        else {}
    )
    return [_claim_response(claim, session, items) for claim in claims]


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

    return _claim_response(claim, session)


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

    return [_claim_response(claim, session) for claim in session.exec(stmt).all()]


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

    return _claim_response(
        _update_claim_and_item(claim, ItemStatus.VERIFIED, ItemStatus.VERIFIED, session),
        session,
    )


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
    """Reject a claim and preserve it in the claim history."""
    claim = session.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found")

    claim.status = ItemStatus.REJECTED
    session.add(claim)
    session.commit()
    session.refresh(claim)
    return _claim_response(claim, session)


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

    return _claim_response(
        _update_claim_and_item(claim, ItemStatus.RETURNED, ItemStatus.RETURNED, session),
        session,
    )