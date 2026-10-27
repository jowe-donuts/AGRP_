# Backend Endpoints - Complete Reference

## Summary of All Endpoints

Total: **21 API Endpoints** across 4 routers

---

## 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/register` | Create new user account | No |
| POST | `/login` | Login with email/password | No |
| GET | `/me` | Get current user profile | Yes |
| PATCH | `/me` | Update user profile (full_name) | Yes |

---

## 📦 Items (`/api/items`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/lost` | Report a lost item | Yes |
| POST | `/found` | Report a found item | Yes |
| GET | `/` | List items with filters & pagination | No |
| GET | `/search` | Full-text search items | No |
| GET | `/{id}` | Get item details | No |
| GET | `/{id}/match-result` | Get AI match score for item | No |
| DELETE | `/{id}` | Delete an item | Yes |

**List/Search Query Parameters:**
- `status` (optional): "lost" or "found"
- `category` (optional): "electronics", "clothing", "accessory", "document", "other"
- `color` (optional): filter by color
- `brand` (optional): filter by brand
- `sort_by` (optional): "date_reported" or "title"
- `order` (optional): "asc" or "desc"
- `page` (default: 1): pagination page
- `size` (default: 50): items per page

**Search Query Parameters:**
- `q` (required): search query (min 2 chars)
- `status`, `category` (optional): additional filters
- `page`, `size` (optional): pagination

---

## 🎯 Claims (`/api/claims`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---|---|
| POST | `/` | Submit a claim on item | Yes | Any |
| GET | `/` | List all claims | Yes | Staff/Admin |
| GET | `/{id}` | Get claim details | Yes | Any |
| PATCH | `/{id}/approve` | Approve claim & mark verified | Yes | Staff/Admin |
| PATCH | `/{id}/reject` | Reject a claim | Yes | Staff/Admin |
| PATCH | `/{id}/return` | Mark item as returned | Yes | Staff/Admin |

---

## 📊 Admin (`/api/admin`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---|---|
| GET | `/stats` | System statistics & metrics | Yes | Admin |
| GET | `/items/status/{status}` | List items by status | Yes | Admin |
| GET | `/claims/pending` | List pending claims | Yes | Admin |
| GET | `/matches/top` | Top matches by score | Yes | Admin |

**Admin Stats Returned:**
```json
{
  "users": {
    "total": <number>
  },
  "items": {
    "total": <number>,
    "lost": <number>,
    "found": <number>,
    "claimed": <number>,
    "verified": <number>,
    "returned": <number>
  },
  "claims": {
    "total": <number>,
    "claimed": <number>,
    "verified": <number>,
    "returned": <number>
  },
  "matching": {
    "total_matches": <number>,
    "average_match_score": <float>
  }
}
```

---

## 🚀 New Features Added

### 1. **Filterable Items List** ✅
- `GET /api/items/?status=lost&category=electronics&color=blue&sort_by=date_reported&order=desc&page=1&size=50`
- Supports filtering by: status, category, color, brand
- Sorting by: date_reported, title
- Pagination support

### 2. **Full-Text Search** ✅
- `GET /api/items/search?q=laptop&status=lost&category=electronics`
- Searches across: title, description, brand, color
- Case-insensitive matching
- Optional status/category filters

### 3. **Match Result Polling** ✅
- `GET /api/items/{id}/match-result`
- Returns: `candidate_id`, `candidate_title`, `score`, `created_at`
- Allows frontend to poll for AI matching completion
- Returns 404 if not yet computed

### 4. **User Profile Update** ✅
- `PATCH /api/auth/me`
- Update: `full_name`
- Extensible for future fields (avatar, bio, etc.)

### 5. **Admin Dashboard Endpoints** ✅
- `GET /api/admin/stats` – System-wide metrics
- `GET /api/admin/items/status/{status}` – Items by status (paginated)
- `GET /api/admin/claims/pending` – Pending claims awaiting approval
- `GET /api/admin/matches/top` – Top 10 best matches by score

### 6. **CLIP Error Handling** ✅
- Graceful fallback if CLIP model fails to load
- Returns zero-vectors instead of crashing
- Logs all CLIP-related errors
- System remains functional even if AI service is unavailable

---

## 🔄 Complete Workflow Example

```bash
# 1. Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepass123",
  "full_name": "John Doe"
}
# Response: { "access_token": "jwt_token", "token_type": "bearer" }

# 2. Report Lost Item
POST /api/items/lost
Headers: Authorization: Bearer jwt_token
{
  "title": "Blue Laptop",
  "description": "MacBook Pro lost near library",
  "category": "electronics",
  "location": "Building A",
  "color": "blue",
  "brand": "Apple"
}
# Response: { "id": 1, "title": "Blue Laptop" }

# 3. Report Found Item (by different user or staff)
POST /api/items/found
Headers: Authorization: Bearer another_jwt_token
{
  "title": "Found Silver Laptop",
  "description": "Found in computer lab",
  "category": "electronics",
  "location": "Lost & Found Office",
  "color": "silver",
  "brand": "Apple"
}
# Response: { "id": 2, "title": "Found Silver Laptop" }

# 4. Poll for AI Match
GET /api/items/2/match-result
# Response (after embedding completes):
{
  "candidate_id": 1,
  "candidate_title": "Blue Laptop",
  "score": 87.45,
  "created_at": "2026-10-26T15:45:00"
}

# 5. Submit Claim
POST /api/claims/
Headers: Authorization: Bearer jwt_token
{
  "item_id": 2
}
# Response: { "id": 1, "item_id": 2, "status": "claimed", ... }

# 6. Approve Claim (Admin)
PATCH /api/claims/1/approve
Headers: Authorization: Bearer admin_jwt_token
# Response: { "id": 1, "status": "verified", ... }

# 7. Mark as Returned (Admin)
PATCH /api/claims/1/return
Headers: Authorization: Bearer admin_jwt_token
# Response: { "id": 1, "status": "returned", ... }

# 8. View Admin Stats
GET /api/admin/stats
Headers: Authorization: Bearer admin_jwt_token
# Response: { "users": {...}, "items": {...}, "claims": {...}, ... }
```

---

## 🧪 Testing All New Endpoints

Run the updated test suite:
```bash
pytest -v
```

Tests cover:
- ✅ All 21 endpoints
- ✅ Query parameter filtering
- ✅ Search functionality
- ✅ Match result polling
- ✅ RBAC enforcement
- ✅ Error cases

---

## 📋 Endpoint Status

| Feature | Status | Endpoints |
|---------|--------|-----------|
| Authentication | ✅ Complete | 4 endpoints |
| Items CRUD | ✅ Complete | 7 endpoints |
| Items Search | ✅ Complete | 1 endpoint |
| Match Polling | ✅ Complete | 1 endpoint |
| Claims Workflow | ✅ Complete | 6 endpoints |
| Admin Dashboard | ✅ Complete | 4 endpoints |
| **TOTAL** | **✅ COMPLETE** | **21 endpoints** |

---

## 🔧 Implementation Notes

### Error Handling for CLIP
- If CLIP fails to load: returns zero-vectors (match_score = 0)
- If image download fails: logs error, returns zero-vector
- If text encoding fails: logs error, returns zero-vector
- System degrades gracefully; API still responds 200 OK

### Performance Considerations
- Item list/search uses database pagination (efficient)
- Admin stats queries use SQLite COUNT functions (fast)
- Match scoring deferred to Celery workers (non-blocking)
- No N+1 queries; uses eager loading where needed

### Security
- All protected endpoints require valid JWT
- RBAC enforced via `require_role()` dependency
- Role hierarchy: Admin > Staff > Student
- Admin endpoints hidden from non-admin users (403 Forbidden)

---

## 📚 API Documentation

Auto-generated Swagger UI available at:
```
http://localhost:8000/docs
```

ReDoc documentation available at:
```
http://localhost:8000/redoc
```

---

## 🚀 Ready for Frontend

The backend is now **production-ready** with all required endpoints. Frontend can:
- ✅ Register / Login users
- ✅ Report lost/found items (with image upload)
- ✅ Search and filter items
- ✅ Poll for AI match results
- ✅ Submit and manage claims
- ✅ Admin dashboard with stats
- ✅ Full RBAC support

**No additional backend endpoints needed.**
