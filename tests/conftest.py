"""Pytest fixtures: isolated SQLite DB, TestClient, seeded users, CLIP stubbed out."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlmodel import Session, SQLModel

from app.main import app
from app.db.models import Role, User
from app.db.session import get_session
from app.core.security import hash_password


@pytest.fixture()
def db_engine(tmp_path):
    """Fresh SQLite file per test; schema created from SQLModel metadata."""
    engine = create_engine(f"sqlite:///{tmp_path / 'test.db'}", future=True)
    SQLModel.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture()
def client(db_engine, monkeypatch):
    """FastAPI TestClient with the app's get_session dependency pointed at the test DB.

    CLIP work is stubbed so tests never load the model or run matching.
    """
    import app.api.items as items_mod

    monkeypatch.setattr(items_mod, "generate_item_embedding", lambda item_id: None)
    monkeypatch.setattr(items_mod, "run_matching_sweep", lambda item_id: None)

    def override_get_session():
        with Session(db_engine) as session:
            try:
                yield session
                session.commit()
            except Exception:
                session.rollback()
                raise

    app.dependency_overrides[get_session] = override_get_session
    try:
        with TestClient(app) as c:
            yield c
    finally:
        app.dependency_overrides.clear()


@pytest.fixture()
def users(db_engine, client):
    """Seed one user per role. Returns {email: password}."""
    creds = {
        "admin@example.com": "adminpass123",
        "staff@example.com": "staffpass123",
        "student@example.com": "studentpass123",
        "student2@example.com": "student2pass123",
    }
    roles = {
        "admin@example.com": Role.ADMIN,
        "staff@example.com": Role.STAFF,
        "student@example.com": Role.STUDENT,
        "student2@example.com": Role.STUDENT,
    }
    with Session(db_engine) as s:
        for email, pw in creds.items():
            s.add(User(email=email, hashed_password=hash_password(pw), role=roles[email], full_name=email))
        s.commit()
    return creds


@pytest.fixture()
def auth(client, users):
    """auth(email) -> Authorization headers for a seeded user (via /api/auth/login)."""

    def login(email, password=None):
        pw = password or users[email]
        r = client.post("/api/auth/login", data={"username": email, "password": pw})
        assert r.status_code == 200, r.text
        return {"Authorization": "Bearer " + r.json()["access_token"]}

    return login
