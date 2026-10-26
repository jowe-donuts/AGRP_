# Backend Testing Guide

## Overview

The backend has a comprehensive test suite covering:
- **Authentication** (`test_auth.py`) – Registration, login, profile retrieval
- **Items** (`test_items.py`) – CRUD operations for lost/found items
- **Claims** (`test_claims.py`) – Claim submission, approval, verification workflow
- **Integration** (`test_integration.py`) – End-to-end workflows and RBAC enforcement

All tests use an in-memory SQLite database for fast, isolated execution.

---

## Running Tests

### Run all tests:
```bash
pytest
```

### Run tests for a specific module:
```bash
pytest tests/test_auth.py
pytest tests/test_items.py
pytest tests/test_claims.py
pytest tests/test_integration.py
```

### Run a specific test:
```bash
pytest tests/test_auth.py::test_login_success
```

### Run with verbose output:
```bash
pytest -v
```

### Run with coverage report:
```bash
pip install pytest-cov
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

### Run only marked tests:
```bash
pytest -m auth
pytest -m items
pytest -m claims
pytest -m integration
```

---

## Test Structure

### Fixtures (in `conftest.py`)

| Fixture | Purpose |
|---------|---------|
| `session` | In-memory SQLite database session |
| `client` | FastAPI test client |
| `test_user` | Regular student user for tests |
| `test_admin` | Admin user for privileged operations |
| `test_token` | Valid JWT token for `test_user` |
| `test_admin_token` | Valid JWT token for `test_admin` |

### Example Usage:
```python
def test_something(client: TestClient, test_token, test_user):
    """Test that uses authenticated client and user."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {test_token}"}
    )
    assert response.status_code == 200
```

---

## Test Coverage

### Authentication (`test_auth.py`)
- ✅ Successful registration
- ✅ Duplicate email prevention
- ✅ Invalid email validation
- ✅ Successful login
- ✅ Wrong password rejection
- ✅ Nonexistent user rejection
- ✅ Get authenticated user profile
- ✅ Unauthenticated profile access prevention
- ✅ Invalid token rejection

### Items (`test_items.py`)
- ✅ Create lost item (authenticated)
- ✅ Create found item (authenticated)
- ✅ Unauthenticated item creation prevention
- ✅ Missing required fields validation
- ✅ Retrieve item by ID
- ✅ Nonexistent item handling (404)
- ✅ List all items
- ✅ Delete item (authenticated)
- ✅ All valid categories
- ✅ Invalid category rejection

### Claims (`test_claims.py`)
- ✅ Create claim (authenticated)
- ✅ Unauthenticated claim prevention
- ✅ Nonexistent item claim prevention
- ✅ Duplicate claim prevention
- ✅ Retrieve claim (authenticated)
- ✅ List claims (admin/staff only)
- ✅ Student cannot list claims (403)
- ✅ Approve claim (admin/staff only)
- ✅ Reject claim (admin/staff only)
- ✅ Mark item as returned (admin/staff only)
- ✅ Return without verification prevention

### Integration (`test_integration.py`)
- ✅ Complete lost-and-found workflow
- ✅ Multiple items and claims handling
- ✅ RBAC enforcement across endpoints

---

## Expected Test Output

When you run `pytest -v`, you should see output like:

```
tests/test_auth.py::test_register_success PASSED                    [2%]
tests/test_auth.py::test_register_duplicate_email PASSED            [4%]
tests/test_auth.py::test_login_success PASSED                       [6%]
...
tests/test_items.py::test_create_lost_item_authenticated PASSED     [25%]
...
tests/test_claims.py::test_create_claim_authenticated PASSED        [50%]
...
tests/test_integration.py::test_complete_lost_and_found_workflow PASSED [95%]

======================== X passed in Y.ZZs ========================
```

---

## Debugging Failed Tests

### View full error traceback:
```bash
pytest -v --tb=long
```

### Stop on first failure:
```bash
pytest -x
```

### Drop into debugger on failure:
```bash
pytest --pdb
```

### Print debug output:
```python
def test_example(client):
    response = client.get("/some/endpoint")
    print(response.json())  # This will show during test execution
    assert response.status_code == 200
```

Run with:
```bash
pytest -v -s
```

---

## Common Issues & Solutions

### Issue: `ModuleNotFoundError: No module named 'app'`
**Solution:** Run pytest from the project root:
```bash
cd C:\Users\Joey\Documents\AGRP_
pytest
```

### Issue: `SQLAlchemy.exc.OperationalError: database is locked`
**Solution:** The in-memory SQLite should not have this, but if you do:
```bash
# Delete any lingering database files
rm agp.db
rm agp.db-shm
rm agp.db-wal
pytest
```

### Issue: Tests pass locally but fail in CI
**Solution:** Ensure `.env` is NOT committed to git. Create a `.env.test` file for CI:
```bash
# .env.test
DATABASE_URL=sqlite://
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1
```

---

## Adding New Tests

### Template for new test:
```python
def test_new_feature(client: TestClient, test_token):
    """Test description here."""
    response = client.post(
        "/api/endpoint",
        headers={"Authorization": f"Bearer {test_token}"},
        json={"key": "value"},
    )
    assert response.status_code == 201
    assert "expected_field" in response.json()
```

### Best Practices:
1. **One assertion per test** (ideally) – makes failures clear
2. **Descriptive names** – `test_login_with_wrong_password_fails` not `test_login_2`
3. **Use fixtures** – don't create users/items in every test
4. **Test both happy path and error cases** – success AND failures
5. **Group related tests** – use test classes or `@pytest.mark.category`

---

## Continuous Integration (GitHub Actions)

Example CI workflow (add to `.github/workflows/tests.yml`):

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt
      - run: pytest -v --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v3
```

---

## Running Tests During Development

### Watch mode (auto-rerun on file changes):
```bash
pip install pytest-watch
ptw
```

### Run tests while backend is running:
```bash
# Terminal 1: Start backend
start_backend.bat

# Terminal 2: Run tests (in separate environment/folder)
pytest -v
```

---

## Summary

**Before committing code:**
```bash
pytest -v --cov=app
```

**All tests should pass** before opening a pull request.

Questions? Check the test files directly – they document the expected behavior!
