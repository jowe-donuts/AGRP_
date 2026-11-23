"""Shared fixtures and utilities for lost & found tests."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlmodel import Session, SQLModel, metadata
from app.db.models import User, Item, Role, ItemStatus, Category, Claim
from app.core.security import create_access_token


def get_sqlite_url() -> str:
    """In-memory SQLite for tests (isolated)."""
    return "sqlite:///test_agp.db"


@pytest.fixture(name="client")
def test_client() -> TestClient:
    """FastAPI test client with in-memory DB."""
    from app.db.models import SQLModel, metadata
    engine = create_engine(get_sqlite_url())
    SQLModel.metadata.create_all(engine)
    from app.main import app
    def override_get_db():
        with Session(engine) as session:
            try:
                yield session
                session.commit()
            except Exception:
                session.rollback()
                raise
    app.dependency_overrides[get_session] = override_get_db
    try:
        with TestClient(app) as c:
            yield c
    finally:
        app.dependency_overrides.clear()


@pytest.fixture(name="admin_token")
def _admin_token(client: TestClient) -> str:
    """Create a test admin and return their JWT."""
    engine = create_engine(get_sqlite_url())
    with Session(engine) as sess:
        admin = User(
            email="test-admin@example.com",
            hashed_password=hash_password("admin123"),
            role=Role.ADMIN,
        )
        sess.add(admin)
        sess.commit()
        sess.refresh(admin)
    return create_access_token(subject=str(admin.id))


@pytest.fixture(name="student_token")
def _student_token(client: TestClient) -> str:
    """Create a test student and return their JWT."""
    from app.core.security import create_access_token
    engine = create_engine(get_sqlite_url())
    with Session(engine) as sess:
        student = User(
            email="test-student@example.com",
            hashed_password=hash_password("student123"),
            role=Role.STUDENT,
        )
        sess.add(student)
        sess.commit()
        sess.refresh(student)
    return create_access_token(subject=str(student.id))


@pytest.fixture(name="student_user")
def _student_user(client: TestClient) -> User:
    """Create and return a test student user."""
    engine = create_engine(get_sqlite_url())
    with Session(engine) as sess:
        u = User(
            email="user@example.com",
            hashed_password=hash_password("123"),
            role=Role.STUDENT,
            full_name="Test User",
        )
        sess.add(u)
        sess.commit()
        sess.refresh(u)
        return u