"""SQLModel database models for the Lost & Found platform.

These models capture the essential domain entities:
- ``User`` with role‑based access control
- ``Item`` representing a lost or found report (with optional image URLs)
- ``Claim`` linking a user to an item and tracking the claim workflow

The enums are stored as strings, which FastAPI/OpenAPI documents automatically.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, Relationship, SQLModel

# ----------------------------------------------------------------------
# Enumerations
# ----------------------------------------------------------------------
class Role(str, Enum):
    """User roles used for RBAC."""

    STUDENT = "student"
    STAFF = "staff"
    ADMIN = "admin"


class ItemStatus(str, Enum):
    """Lifecycle states for an item report."""

    LOST = "lost"
    FOUND = "found"
    CLAIMED = "claimed"
    VERIFIED = "verified"
    RETURNED = "returned"


class Category(str, Enum):
    """Broad categories of lost/found objects."""

    ELECTRONICS = "electronics"
    CLOTHING = "clothing"
    ACCESSORY = "accessory"
    DOCUMENT = "document"
    OTHER = "other"


# ----------------------------------------------------------------------
# Core Tables
# ----------------------------------------------------------------------
class User(SQLModel, table=True):
    """Application user.

    Passwords are stored as a bcrypt hash – see :pymod:`app.core.security`.
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    full_name: Optional[str] = Field(default=None, nullable=True)
    hashed_password: str = Field(nullable=False)
    role: Role = Field(default=Role.STUDENT, nullable=False)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships – forward declarations use string literals to avoid circular imports
    items: List["Item"] = Relationship(back_populates="owner")
    claims: List["Claim"] = Relationship(back_populates="claimant")


class Item(SQLModel, table=True):
    """A lost or found item report."""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True, nullable=False)
    description: str = Field(nullable=False)
    category: Category = Field(nullable=False)
    color: Optional[str] = Field(default=None)
    brand: Optional[str] = Field(default=None)
    location: str = Field(nullable=False)  # e.g. "Building A, Room 101"
    date_reported: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: ItemStatus = Field(default=ItemStatus.LOST, nullable=False)
    # Store an array of public image URLs (JSONB column in PostgreSQL)
    image_urls: List[str] = Field(
        default_factory=list,
        sa_type=JSON().with_variant(JSONB(), "postgresql"),
    )

    owner_id: int = Field(foreign_key="user.id")
    owner: User = Relationship(back_populates="items")

    claims: List["Claim"] = Relationship(back_populates="item")


class Claim(SQLModel, table=True):
    """A claim that a user believes an item belongs to them."""

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Claim status mirrors ``ItemStatus`` but starts at CLAIMED
    status: ItemStatus = Field(default=ItemStatus.CLAIMED, nullable=False)

    item_id: int = Field(foreign_key="item.id")
    item: Item = Relationship(back_populates="claims")

    claimant_id: int = Field(foreign_key="user.id")
    claimant: User = Relationship(back_populates="claims")

# ----------------------------------------------------------------------
# Match Table – stores CLIP similarity results between opposite‑type items
# ----------------------------------------------------------------------
class Match(SQLModel, table=True):
    """Result of a CLIP similarity comparison.

    ``item_id`` is the source (the item for which we performed the sweep).
    ``candidate_id`` is the opposite‑type item with the highest similarity.
    ``score`` is a float in the range 0‑100 representing the match confidence.
    """

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    item_id: int = Field(foreign_key="item.id", index=True)
    candidate_id: int = Field(foreign_key="item.id", index=True)
    score: float = Field(nullable=False)

    # Optional relationships for convenience (not required for queries)
    # We explicitly specify foreign_keys to disambiguate which FK each relationship uses
    item: Item = Relationship(
        back_populates=None, 
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "Match.item_id"
        }
    )
    candidate: Item = Relationship(
        back_populates=None, 
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "Match.candidate_id"
        }
    )
