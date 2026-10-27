"""Database session handling for FastAPI.

We expose a ``get_session`` dependency that yields a SQLModel ``Session`` bound to the
engine defined by ``settings.database_url``. The session is closed automatically after
the request finishes.
"""

from __future__ import annotations

from typing import Generator

from sqlmodel import Session, create_engine

from app.core.config import settings

# Engine is created once at import time. ``echo=False`` keeps logs quiet in prod.
engine = create_engine(settings.database_url, echo=False, future=True)


def get_engine():
    """Return the SQLAlchemy engine – useful for Alembic migrations."""
    return engine


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a DB ``Session``.

    The session is committed on successful exit and rolled back on exception.
    """
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
