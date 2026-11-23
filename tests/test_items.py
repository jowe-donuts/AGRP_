"""Item endpoint tests: creation, listing, match enrichment, deletion."""
from sqlmodel import Session
from app.db.models import Item, Match, ItemStatus, Category


def test_create_lost_item(client, auth):
    h = auth("student@example.com")
    r = client.post(
        "/api/items/lost",
        headers=h,
        data={"title": "Lost Test Phone", "description": "a phone", "category": "electronics", "location": "Library"},
    )
    assert r.status_code == 201, r.text
    new_id = r.json()["id"]
    got = client.get(f"/api/items/{new_id}")
    assert got.status_code == 200
    assert got.json()["title"] == "Lost Test Phone"
    assert got.json()["status"] == "lost"


def test_create_found_item_requires_auth(client):
    r = client.post("/api/items/found", data={"title": "X", "description": "y", "category": "keys", "location": "Z"})
    assert r.status_code == 401


def test_list_items_enriched_with_match(client, auth, db_engine):
    """A lost item with a best-match against a found item shows up in match_scores."""
    h = auth("student@example.com")
    lost = client.post("/api/items/lost", headers=h, data={"title": "Lost Ring", "description": "ring", "category": "accessory", "location": "Cafe"}).json()
    found = client.post("/api/items/found", headers=h, data={"title": "Found Ring", "description": "ring", "category": "accessory", "location": "Cafe"}).json()

    # Insert a match row directly (CLIP is stubbed in tests)
    with Session(db_engine) as s:
        s.add(Match(item_id=lost["id"], candidate_id=found["id"], score=87.5))
        s.commit()

    lst = client.get(f"/api/items/?status=lost")
    assert lst.status_code == 200
    row = next(i for i in lst.json() if i["id"] == lost["id"])
    assert row["match_scores"][0]["candidate_title"] == "Found Ring"
    assert row["match_scores"][0]["score"] == 87.5


def test_unknown_item_404(client, auth):
    assert client.get("/api/items/99999").status_code == 404


def test_delete_item(client, auth):
    h = auth("student@example.com")
    created = client.post("/api/items/lost", headers=h, data={"title": "To Delete", "description": "x", "category": "other", "location": "Yard"}).json()
    assert client.delete(f"/api/items/{created['id']}", headers=h).status_code in (200, 204)
    assert client.get(f"/api/items/{created['id']}").status_code == 404
