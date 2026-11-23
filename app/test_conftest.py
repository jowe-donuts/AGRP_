"""Pytest fixtures and configuration for the lost & found integration tests."""
import os
from typing import Generator
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.main import app
from app.db.session import get_session
from app.db.models import User, Item, Role, ItemStatus, Category
from app.core.security import hash_password
from app.core.config import settings
import tempfile


def get_test_db() -> Generator[Session, None, None]:
    """Generator that provides a fresh, in-memory SQLite session for tests."""
    # Use an in-memory SQLite DB for isolation (tests won't pollute production-like data)
    # This matches the same engine backend as the real app
    engine = create_engine(get_sqlite_url())

    def _get_session():
        with Session(engine) as session:
            session.commit()
            yield session

    return _get_session()