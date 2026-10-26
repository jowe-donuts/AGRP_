"""Tests for claims endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.db.models import ItemStatus


def test_create_claim_authenticated(client: TestClient, test_token, test_user):
    """Test creating a claim when authenticated."""
    # First create an item
    item_response = client.post(
        "/api/items/found",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Found Phone",
            "description": "Found in cafeteria",
            "category": "electronics",
            "location": "Cafeteria",
        },
    )
    item_id = item_response.json()["id"]

    # Now create a claim
    response = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": item_id},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["item_id"] == item_id
    assert data["claimant_id"] == test_user.id
    assert data["status"] == "claimed"


def test_create_claim_unauthenticated(client: TestClient, test_user):
    """Test creating a claim without authentication fails."""
    response = client.post(
        "/api/claims/",
        json={"item_id": 1},
    )
    assert response.status_code == 403


def test_create_claim_nonexistent_item(client: TestClient, test_token):
    """Test creating a claim for nonexistent item fails."""
    response = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": 99999},
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_create_duplicate_claim(client: TestClient, test_token, test_user):
    """Test creating a duplicate claim fails."""
    # Create an item
    item_response = client.post(
        "/api/items/found",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Found Laptop",
            "description": "Found in library",
            "category": "electronics",
            "location": "Library",
        },
    )
    item_id = item_response.json()["id"]

    # Create first claim
    response1 = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": item_id},
    )
    assert response1.status_code == 201

    # Try to create duplicate claim
    response2 = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": item_id},
    )
    assert response2.status_code == 400
    assert "already claimed" in response2.json()["detail"].lower()


def test_read_claim_authenticated(client: TestClient, test_token, test_user):
    """Test reading a claim when authenticated."""
    # Create an item and claim
    item_response = client.post(
        "/api/items/found",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Found Tablet",
            "description": "Found in classroom",
            "category": "electronics",
            "location": "Classroom A",
        },
    )
    item_id = item_response.json()["id"]

    claim_response = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": item_id},
    )
    claim_id = claim_response.json()["id"]

    # Read the claim
    response = client.get(
        f"/api/claims/{claim_id}",
        headers={"Authorization": f"Bearer {test_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == claim_id
    assert data["item_id"] == item_id
    assert data["status"] == "claimed"


def test_read_claim_unauthenticated(client: TestClient):
    """Test reading a claim without authentication fails."""
    response = client.get("/api/claims/1")
    assert response.status_code == 403


def test_list_claims_staff_only(client: TestClient, test_admin_token):
    """Test listing claims (staff/admin only)."""
    response = client.get(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_claims_student_forbidden(client: TestClient, test_token):
    """Test listing claims fails for non-staff users."""
    response = client.get(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
    )
    assert response.status_code == 403
    assert "privileges" in response.json()["detail"].lower()


def test_approve_claim_staff_only(client: TestClient, test_token, test_admin_token, test_user):
    """Test approving a claim (staff only)."""
    # Create item and claim (as regular user)
    item_response = client.post(
        "/api/items/found",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Found Watch",
            "description": "Found in parking lot",
            "category": "accessory",
            "location": "Parking Lot",
        },
    )
    item_id = item_response.json()["id"]

    claim_response = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": item_id},
    )
    claim_id = claim_response.json()["id"]

    # Approve as admin
    response = client.patch(
        f"/api/claims/{claim_id}/approve",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "verified"


def test_approve_claim_student_forbidden(client: TestClient, test_token, test_user):
    """Test approving a claim fails for non-staff users."""
    # Create item and claim
    item_response = client.post(
        "/api/items/found",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Found Ring",
            "description": "Found at lost and found",
            "category": "accessory",
            "location": "Lost & Found Office",
        },
    )
    item_id = item_response.json()["id"]

    claim_response = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": item_id},
    )
    claim_id = claim_response.json()["id"]

    # Try to approve as regular user
    response = client.patch(
        f"/api/claims/{claim_id}/approve",
        headers={"Authorization": f"Bearer {test_token}"},
    )
    assert response.status_code == 403


def test_reject_claim_staff_only(client: TestClient, test_token, test_admin_token):
    """Test rejecting a claim (staff only)."""
    # Create item and claim
    item_response = client.post(
        "/api/items/found",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Found Glasses",
            "description": "Found in hallway",
            "category": "accessory",
            "location": "Hallway B",
        },
    )
    item_id = item_response.json()["id"]

    claim_response = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": item_id},
    )
    claim_id = claim_response.json()["id"]

    # Reject as admin
    response = client.patch(
        f"/api/claims/{claim_id}/reject",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert response.status_code == 200


def test_return_item_staff_only(client: TestClient, test_token, test_admin_token):
    """Test marking item as returned (staff only, requires verified status)."""
    # Create item and claim
    item_response = client.post(
        "/api/items/found",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Found Umbrella",
            "description": "Found at entrance",
            "category": "accessory",
            "location": "Main Entrance",
        },
    )
    item_id = item_response.json()["id"]

    claim_response = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": item_id},
    )
    claim_id = claim_response.json()["id"]

    # First approve the claim
    client.patch(
        f"/api/claims/{claim_id}/approve",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )

    # Now mark as returned
    response = client.patch(
        f"/api/claims/{claim_id}/return",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "returned"


def test_return_item_without_verification(client: TestClient, test_token, test_admin_token):
    """Test marking item as returned fails without verification."""
    # Create item and claim
    item_response = client.post(
        "/api/items/found",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Found Scarf",
            "description": "Found in building",
            "category": "clothing",
            "location": "Building C",
        },
    )
    item_id = item_response.json()["id"]

    claim_response = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": item_id},
    )
    claim_id = claim_response.json()["id"]

    # Try to return without approval
    response = client.patch(
        f"/api/claims/{claim_id}/return",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert response.status_code == 400
    assert "verified" in response.json()["detail"].lower()
