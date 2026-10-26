"""Tests for authentication endpoints."""

import pytest
from fastapi.testclient import TestClient


def test_register_success(client: TestClient):
    """Test successful user registration."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "securepass123",
            "full_name": "New User",
        },
    )
    assert response.status_code == 201
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_register_duplicate_email(client: TestClient, test_user):
    """Test registration fails with duplicate email."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": test_user.email,
            "password": "password123",
            "full_name": "Another User",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_register_invalid_email(client: TestClient):
    """Test registration fails with invalid email."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "not-an-email",
            "password": "password123",
        },
    )
    assert response.status_code == 422  # Validation error


def test_login_success(client: TestClient, test_user):
    """Test successful login."""
    response = client.post(
        "/api/auth/login",
        data={"username": test_user.email, "password": "testpassword123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient, test_user):
    """Test login fails with wrong password."""
    response = client.post(
        "/api/auth/login",
        data={"username": test_user.email, "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_login_nonexistent_user(client: TestClient):
    """Test login fails with nonexistent email."""
    response = client.post(
        "/api/auth/login",
        data={"username": "nouser@example.com", "password": "password123"},
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_read_me_authenticated(client: TestClient, test_user, test_token):
    """Test reading user profile when authenticated."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {test_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name
    assert data["role"] == "student"
    assert data["is_active"] is True


def test_read_me_unauthenticated(client: TestClient):
    """Test reading user profile without authentication."""
    response = client.get("/api/auth/me")
    assert response.status_code == 403


def test_read_me_invalid_token(client: TestClient):
    """Test reading user profile with invalid token."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid-token-here"},
    )
    assert response.status_code == 401
