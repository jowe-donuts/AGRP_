"""Add updated_at timestamps for audit trail.

Revision ID: 20261027_04_add_updated_at_timestamps
Revises: 20261027_03_add_constraints_and_indexes
Create Date: 2026-10-27 08:55:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20261027_04_add_updated_at_timestamps"
down_revision = "20261027_03_add_constraints_and_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add updated_at to User table
    op.add_column(
        "user",
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    # Add updated_at to Item table
    op.add_column(
        "item",
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    # Add updated_at to Claim table
    op.add_column(
        "claim",
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )

    # Add updated_at to Match table
    op.add_column(
        "match",
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )


def downgrade() -> None:
    op.drop_column("match", "updated_at")
    op.drop_column("claim", "updated_at")
    op.drop_column("item", "updated_at")
    op.drop_column("user", "updated_at")
