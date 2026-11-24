"""Auth endpoint tests: register, login, /me, batch user lookup RBAC."""


def test_register_new_user(client):
    r = client.post("/api/auth/register", json={"email": "newbie@example.com", "password": "newpass123"})
    assert r.status_code == 201, r.text
    me = client.get("/api/auth/me", headers={"Authorization": "Bearer " + r.json()["access_token"]})
    assert me.status_code == 200
    assert me.json()["email"] == "newbie@example.com"
    assert me.json()["role"] == "student"


def test_register_duplicate_email_rejected(client, users):
    r = client.post("/api/auth/register", json={"email": "student@example.com", "password": "x12345678"})
    assert r.status_code == 400


def test_login_bad_password_rejected(client, users):
    r = client.post("/api/auth/login", data={"username": "student@example.com", "password": "wrong"})
    assert r.status_code == 401


def test_me_requires_token(client):
    assert client.get("/api/auth/me").status_code == 401


def test_batch_users_requires_staff_or_admin(client, users, auth):
    student_headers = auth("student@example.com")
    assert client.get("/api/auth/users", params={"ids": [3]}, headers=student_headers).status_code == 403

    admin_headers = auth("admin@example.com")
    r = client.get("/api/auth/users", params={"ids": [3]}, headers=admin_headers)
    assert r.status_code == 200
    assert r.json()[0]["email"] == "student@example.com"
