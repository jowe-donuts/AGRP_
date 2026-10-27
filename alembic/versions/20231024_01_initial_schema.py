"""Initial schema: User, Item, Claim tables (SQLite compatible).

Revision ID: 20231024_01_initial_schema
Revises: 
Create Date: 2026-10-26 15:04:50.188000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20231024_01_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create User table
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),  # stored as string, not ENUM
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_user_email"), "user", ["email"], unique=True)

    # Create Item table
    op.create_table(
        "item",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),  # stored as string, not ENUM
        sa.Column("color", sa.String(), nullable=True),
        sa.Column("brand", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=False),
        sa.Column("date_reported", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("status", sa.String(), nullable=False),  # stored as string, not ENUM
        sa.Column("image_urls", sa.Text(), nullable=False, server_default="[]"),  # JSON as TEXT
        sa.Column("clip_embedding", sa.Text(), nullable=True),  # JSON as TEXT
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["user.id"], ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_item_title"), "item", ["title"], unique=False)

    # Create Claim table
    op.create_table(
        "claim",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("status", sa.String(), nullable=False),  # stored as string, not ENUM
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("claimant_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["claimant_id"], ["user.id"], ),
        sa.ForeignKeyConstraint(["item_id"], ["item.id"], ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create Match table
    op.create_table(
        "match",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["item_id"], ["item.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["candidate_id"], ["item.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_match_item_id"), "match", ["item_id"], unique=False)
    op.create_index(op.f("ix_match_candidate_id"), "match", ["candidate_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_match_candidate_id"), table_name="match")
    op.drop_index(op.f("ix_match_item_id"), table_name="match")
    op.drop_table("match")
    op.drop_table("claim")
    op.drop_index(op.f("ix_item_title"), table_name="item")
    op.drop_table("item")
    op.drop_index(op.f("ix_user_email"), table_name="user")
    op.drop_table("user")
