"""Integration tests for the entire backend workflow."""

import pytest
from fastapi.testclient import TestClient

from app.db.models import ItemStatus


def test_complete_lost_and_found_workflow(client: TestClient, test_token, test_admin_token, test_user, test_admin):
    """Test the complete workflow: report lost item, find item, claim, verify, return."""
    
    # Step 1: User reports a lost item
    lost_response = client.post(
        "/api/items/lost",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Lost Laptop",
            "description": "MacBook Pro 15 inch, silver, with stickers",
            "category": "electronics",
            "location": "Computer Lab, Building A",
            "color": "silver",
            "brand": "Apple",
        },
    )
    assert lost_response.status_code == 201
    lost_item = lost_response.json()
    lost_item_id = lost_item["id"]
    print(f"✓ Lost item reported: ID {lost_item_id}")

    # Step 2: Another user (or staff) reports finding a similar item
    found_response = client.post(
        "/api/items/found",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Found Laptop",
            "description": "Silver MacBook Pro left in computer lab",
            "category": "electronics",
            "location": "Lost & Found Office",
            "color": "silver",
            "brand": "Apple",
        },
    )
    assert found_response.status_code == 201
    found_item = found_response.json()
    found_item_id = found_item["id"]
    print(f"✓ Found item reported: ID {found_item_id}")

    # Step 3: User submits a claim on the found item
    claim_response = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": found_item_id},
    )
    assert claim_response.status_code == 201
    claim = claim_response.json()
    claim_id = claim["id"]
    assert claim["status"] == "claimed"
    print(f"✓ Claim submitted: ID {claim_id}")

    # Step 4: Admin approves the claim
    approve_response = client.patch(
        f"/api/claims/{claim_id}/approve",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert approve_response.status_code == 200
    approved_claim = approve_response.json()
    assert approved_claim["status"] == "verified"
    print(f"✓ Claim approved and verified")

    # Step 5: Admin marks the item as returned
    return_response = client.patch(
        f"/api/claims/{claim_id}/return",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert return_response.status_code == 200
    returned_claim = return_response.json()
    assert returned_claim["status"] == "returned"
    print(f"✓ Item marked as returned to owner")

    # Step 6: Verify the item can still be retrieved
    item_check = client.get(f"/api/items/{found_item_id}")
    assert item_check.status_code == 200
    print(f"✓ Item workflow complete!")


def test_multiple_items_and_claims(client: TestClient, test_token, test_admin_token):
    """Test handling multiple items and claims simultaneously."""
    
    items_created = []
    claims_created = []

    # Create multiple lost items
    for i in range(3):
        response = client.post(
            "/api/items/lost",
            headers={"Authorization": f"Bearer {test_token}"},
            data={
                "title": f"Lost Item {i}",
                "description": f"Description for item {i}",
                "category": ["electronics", "clothing", "accessory"][i],
                "location": f"Location {i}",
            },
        )
        assert response.status_code == 201
        items_created.append(response.json()["id"])

    # Create multiple found items
    for i in range(3):
        response = client.post(
            "/api/items/found",
            headers={"Authorization": f"Bearer {test_token}"},
            data={
                "title": f"Found Item {i}",
                "description": f"Found description {i}",
                "category": ["document", "other", "electronics"][i],
                "location": f"Found at {i}",
            },
        )
        assert response.status_code == 201
        items_created.append(response.json()["id"])

    print(f"✓ Created {len(items_created)} items")

    # Create multiple claims
    for item_id in items_created[3:]:  # Claims on found items
        response = client.post(
            "/api/claims/",
            headers={"Authorization": f"Bearer {test_token}"},
            json={"item_id": item_id},
        )
        if response.status_code == 201:
            claims_created.append(response.json()["id"])

    print(f"✓ Created {len(claims_created)} claims")

    # Approve some claims
    for i, claim_id in enumerate(claims_created[:2]):
        response = client.patch(
            f"/api/claims/{claim_id}/approve",
            headers={"Authorization": f"Bearer {test_admin_token}"},
        )
        assert response.status_code == 200
    
    print(f"✓ Approved 2 claims")

    # List all items
    list_response = client.get("/api/items/")
    assert list_response.status_code == 200
    all_items = list_response.json()
    assert len(all_items) >= len(items_created)
    print(f"✓ Listed {len(all_items)} items")

    # List all claims (admin only)
    list_claims_response = client.get(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert list_claims_response.status_code == 200
    all_claims = list_claims_response.json()
    assert len(all_claims) >= len(claims_created)
    print(f"✓ Listed {len(all_claims)} claims")


def test_rbac_enforcement(client: TestClient, test_token, test_admin_token):
    """Test that RBAC is properly enforced across endpoints."""
    
    # Student can create items
    student_create = client.post(
        "/api/items/lost",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Student Item",
            "description": "Item by student",
            "category": "other",
            "location": "Somewhere",
        },
    )
    assert student_create.status_code == 201
    print("✓ Student can create items")

    # Student cannot list claims
    student_claims = client.get(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
    )
    assert student_claims.status_code == 403
    print("✓ Student cannot list claims (403 Forbidden)")

    # Admin can list claims
    admin_claims = client.get(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert admin_claims.status_code == 200
    print("✓ Admin can list claims")

    # Student cannot approve claims
    item_response = client.post(
        "/api/items/found",
        headers={"Authorization": f"Bearer {test_token}"},
        data={
            "title": "Found Item for RBAC test",
            "description": "Test",
            "category": "other",
            "location": "Test",
        },
    )
    item_id = item_response.json()["id"]

    claim_response = client.post(
        "/api/claims/",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"item_id": item_id},
    )
    claim_id = claim_response.json()["id"]

    student_approve = client.patch(
        f"/api/claims/{claim_id}/approve",
        headers={"Authorization": f"Bearer {test_token}"},
    )
    assert student_approve.status_code == 403
    print("✓ Student cannot approve claims (403 Forbidden)")

    # Admin can approve claims
    admin_approve = client.patch(
        f"/api/claims/{claim_id}/approve",
        headers={"Authorization": f"Bearer {test_admin_token}"},
    )
    assert admin_approve.status_code == 200
    print("✓ Admin can approve claims")
