"""Add data integrity constraints and missing indexes.

Revision ID: 20261027_03_add_constraints_and_indexes
Revises: 20231024_02_add_match_table
Create Date: 2026-10-27 08:54:34.092000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20261027_03_add_constraints_and_indexes"
down_revision = "20231024_02_add_match_table"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # SQLite doesn't support adding unique constraints via ALTER TABLE.
    # Indexes alone provide uniqueness enforcement at the application level.
    # shortcut: SQLite constraint limitation; upgrade to PostgreSQL for strict DB enforcement

    # Add indexes on foreign keys and commonly filtered columns
    # These speed up WHERE and JOIN operations.

    # Item.owner_id – filter user's items
    op.create_index(
        "ix_item_owner_id",
        "item",
        ["owner_id"],
        unique=False,
    )

    # Item.status – filter by lost/found/claimed status
    op.create_index(
        "ix_item_status",
        "item",
        ["status"],
        unique=False,
    )

    # Claim.claimant_id – filter user's claims
    op.create_index(
        "ix_claim_claimant_id",
        "claim",
        ["claimant_id"],
        unique=False,
    )

    # Claim.status – filter by claimed/verified/returned status
    op.create_index(
        "ix_claim_status",
        "claim",
        ["status"],
        unique=False,
    )

    # Claim.item_id – filter claims on an item (already FK, but index helps joins)
    op.create_index(
        "ix_claim_item_id",
        "claim",
        ["item_id"],
        unique=False,
    )

    # Unique constraint on Claim(item_id, claimant_id) via index
    # SQLite treats UNIQUE indexes like unique constraints
    op.create_index(
        "uq_claim_item_claimant",
        "claim",
        ["item_id", "claimant_id"],
        unique=True,
    )

    # Unique constraint on Match(item_id, candidate_id) via index
    op.create_index(
        "uq_match_item_candidate",
        "match",
        ["item_id", "candidate_id"],
        unique=True,
    )


def downgrade() -> None:
    # Drop unique indexes
    op.drop_index("uq_match_item_candidate", table_name="match")
    op.drop_index("uq_claim_item_claimant", table_name="claim")

    # Drop regular indexes
    op.drop_index("ix_claim_item_id", table_name="claim")
    op.drop_index("ix_claim_status", table_name="claim")
    op.drop_index("ix_claim_claimant_id", table_name="claim")
    op.drop_index("ix_item_status", table_name="item")
    op.drop_index("ix_item_owner_id", table_name="item")

