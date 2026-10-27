"""add Match table for CLIP similarity results

Revision ID: 20231024_02_add_match_table
Revises: 20231024_01_initial_schema
Create Date: 2026-10-24 10:30:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20231024_02_add_match_table"
down_revision = "20231024_01_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create Match table (already included in initial schema for SQLite)
    # This migration is now a no-op since Match was merged into the initial migration
    pass


def downgrade() -> None:
    pass
