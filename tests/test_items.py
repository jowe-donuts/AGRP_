"""Tests for item endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.db.models import Category, ItemStatus


def test_create_lost_item_authenticated(client: TestClient, test_token, test_user):
    """Test creating a lost item when authenticated."""
    response = client.post(
        "/api/items/lost",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Blue Backpack",
            "description": "Lost near the library building",
            "category": "accessory",
            "location": "Building A, 3rd Floor",
            "color": "blue",
            "brand": "Nike",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Blue Backpack"
    assert "id" in data


def test_create_lost_item_unauthenticated(client: TestClient):
    """Test creating a lost item without authentication fails."""
    response = client.post(
        "/api/items/lost",
        data={
            "title": "Blue Backpack",
            "description": "Lost near the library building",
            "category": "accessory",
            "location": "Building A",
        },
    )
    assert response.status_code == 403


def test_create_found_item_authenticated(client: TestClient, test_token):
    """Test creating a found item when authenticated."""
    response = client.post(
        "/api/items/found",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Red Wallet",
            "description": "Found in the cafeteria",
            "category": "accessory",
            "location": "Cafeteria",
            "color": "red",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Red Wallet"


def test_create_item_missing_required_fields(client: TestClient, test_token):
    """Test creating an item fails with missing required fields."""
    response = client.post(
        "/api/items/lost",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Blue Backpack",
            # Missing description, category, location
        },
    )
    assert response.status_code == 422


def test_read_item(client: TestClient, test_token, test_user):
    """Test retrieving an item by ID."""
    # First create an item
    create_response = client.post(
        "/api/items/lost",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Lost Keys",
            "description": "Silver keychain with blue tag",
            "category": "accessory",
            "location": "Library",
        },
    )
    item_id = create_response.json()["id"]

    # Now retrieve it
    response = client.get(f"/api/items/{item_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Lost Keys"
    assert data["id"] == item_id


def test_read_nonexistent_item(client: TestClient):
    """Test retrieving a nonexistent item returns 404."""
    response = client.get("/api/items/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_list_items(client: TestClient, test_token):
    """Test listing items."""
    # Create a few items
    for i in range(3):
        client.post(
            "/api/items/lost",
            headers={"Authorization": f"Bearer {test_token}"},
            data={
                "title": f"Item {i}",
                "description": f"Description {i}",
                "category": "electronics" if i % 2 == 0 else "clothing",
                "location": f"Location {i}",
            },
        )

    # List all items
    response = client.get("/api/items/")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 3


def test_delete_item_authenticated(client: TestClient, test_token):
    """Test deleting an item when authenticated."""
    # Create an item
    create_response = client.post(
        "/api/items/lost",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Item to Delete",
            "description": "This will be deleted",
            "category": "other",
            "location": "Test Location",
        },
    )
    item_id = create_response.json()["id"]

    # Delete it
    response = client.delete(f"/api/items/{item_id}")
    assert response.status_code == 200
    assert "deleted" in response.json()["detail"].lower()

    # Verify it's gone
    response = client.get(f"/api/items/{item_id}")
    assert response.status_code == 404


def test_delete_nonexistent_item(client: TestClient):
    """Test deleting a nonexistent item returns 404."""
    response = client.delete("/api/items/99999")
    assert response.status_code == 404


def test_create_item_with_valid_categories(client: TestClient, test_token):
    """Test creating items with each valid category."""
    categories = ["electronics", "clothing", "accessory", "document", "other"]
    
    for category in categories:
        response = client.post(
            "/api/items/lost",
            headers={"Authorization": f"Bearer {test_token}"},
            data={
                "title": f"Item in {category}",
                "description": "Test item",
                "category": category,
                "location": "Test Location",
            },
        )
        assert response.status_code == 201
        assert response.json()["title"] == f"Item in {category}"


def test_create_item_with_invalid_category(client: TestClient, test_token):
    """Test creating an item with invalid category fails."""
    response = client.post(
        "/api/items/lost",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Invalid Category Item",
            "description": "Test item",
            "category": "invalid_category",
            "location": "Test Location",
        },
    )
    assert response.status_code == 422
