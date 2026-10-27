"""Test configuration and fixtures for the backend."""

import os
from typing import Generator

import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.core.security import create_access_token
from app.db.models import Role, User
from app.db.session import get_session
from app.main import app


# Use in-memory SQLite for tests (fast, isolated)
@pytest.fixture(name="session")
def session_fixture() -> Generator[Session, None, None]:
    """Create a test database session using an in-memory SQLite database."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a FastAPI test client with a test database session."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    
    from fastapi.testclient import TestClient
    return TestClient(app)


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session) -> User:
    """Create a test user in the database."""
    from app.core.security import hash_password
    
    user = User(
        email="testuser@example.com",
        hashed_password=hash_password("testpassword123"),
        full_name="Test User",
        role=Role.STUDENT,
        is_active=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="test_admin")
def test_admin_fixture(session: Session) -> User:
    """Create a test admin user in the database."""
    from app.core.security import hash_password
    
    admin = User(
        email="admin@example.com",
        hashed_password=hash_password("adminpass123"),
        full_name="Admin User",
        role=Role.ADMIN,
        is_active=True,
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


@pytest.fixture(name="test_token")
def test_token_fixture(test_user: User) -> str:
    """Generate a valid JWT token for the test user."""
    return create_access_token(data={"sub": test_user.id, "role": test_user.role.value})


@pytest.fixture(name="test_admin_token")
def test_admin_token_fixture(test_admin: User) -> str:
    """Generate a valid JWT token for the test admin."""
    return create_access_token(data={"sub": test_admin.id, "role": test_admin.role.value})
