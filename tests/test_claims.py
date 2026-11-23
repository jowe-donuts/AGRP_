"""Claim endpoint tests: submission, proof photo, guards, admin RBAC."""
from sqlmodel import Session
from app.db.models import ItemStatus


def _png_bytes() -> bytes:
    # 1x1 blue PNG
    return bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108020000000d"
        "871f0000000a4944415478da63f80f00000200015c2593970000000049454e44ae426082"
    )


def _claim(client, auth, email, item_id, proof=False):
    h = auth(email)
    files = {"proof_image": ("proof.png", _png_bytes(), "image/png")} if proof else None
    return client.post(
        "/api/claims/",
        headers=h,
        data={"item_id": str(item_id)},
        files=files,
    )


def _make_item(client, auth, status):
    h = auth("student@example.com")
    path = "/api/items/lost" if status == "lost" else "/api/items/found"
    r = client.post(path, headers=h, data={"title": f"Item {status}", "description": "d", "category": "keys", "location": "Loc"})
    assert r.status_code == 201, r.text
    return r.json()["id"]


def test_create_claim_with_proof_photo(client, auth):
    item_id = _make_item(client, auth, "lost")
    r = _claim(client, auth, "student@example.com", item_id, proof=True)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["proof_image"], "proof image URL should be stored"
    assert body["status"] == "claimed"


def test_duplicate_claim_by_same_user_blocked(client, auth):
    item_id = _make_item(client, auth, "lost")
    assert _claim(client, auth, "student@example.com", item_id).status_code == 201
    assert _claim(client, auth, "student@example.com", item_id).status_code == 400


def test_claim_on_verified_item_blocked(client, auth, db_engine):
    item_id = _make_item(client, auth, "lost")
    _claim(client, auth, "student@example.com", item_id)
    # Admin approves -> item becomes VERIFIED
    claims = client.get("/api/claims/", headers=auth("admin@example.com")).json()
    claim_id = next(c["id"] for c in claims if c["item_id"] == item_id)
    assert client.patch(f"/api/claims/{claim_id}/approve", headers=auth("admin@example.com")).status_code == 200
    # Second user can no longer claim the verified item
    r = _claim(client, auth, "student2@example.com", item_id)
    assert r.status_code == 409
    assert "no longer available" in r.json()["detail"]


def test_competing_pending_claim_blocked(client, auth):
    item_id = _make_item(client, auth, "lost")
    assert _claim(client, auth, "student@example.com", item_id).status_code == 201
    r = _claim(client, auth, "student2@example.com", item_id)
    assert r.status_code == 409
    assert "pending" in r.json()["detail"]


def test_admin_list_requires_staff_or_admin(client, auth):
    assert client.get("/api/claims/", headers=auth("student@example.com")).status_code == 403
    assert client.get("/api/claims/", headers=auth("staff@example.com")).status_code == 200


def test_unknown_item_claim_404(client, auth):
    assert _claim(client, auth, "student@example.com", 99999).status_code == 404
