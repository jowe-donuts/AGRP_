# AGRP Lost & Found Platform - Project Status

**Date:** 2026-11-21
**Version:** 1.0.0-alpha
**Last Updated:** November 2026

---

## 📊 Overall Status

- **Frontend:** 85% complete (UI exists, data flow mostly connected)
- **Backend:** 90% complete (endpoints implemented, some integrations pending)
- **Features:** 75% complete (major flows work, polish items missing)
- **Documentation:** 50% complete (this file + inline comments)

---

## ✅ Implemented Features

### Core Functionality
- ✅ User authentication (JWT tokens, RBAC: admin > staff > student)
- ✅ Item reporting (lost/found) via `/api/items/lost` and `/api/items/found`
- ✅ Item list display with category filters and search
- ✅ Match score calculation via CLIP embeddings
- ✅ Claim submission workflow (MatchModal → API)
- ✅ Admin claim approval/rejection (approve/reject endpoints)
- ✅ Claims enrichment with item details
- ✅ Admin metrics dashboard (Total, Pending, Approved, Returned)
- ✅ Student dashboard sidebar layout (white theme, pink accents)
- ✅ Landing page with dark theme, social feed, auth modal
- ✅ Responsive design
- ✅ Image upload handling (served from `/uploads`)

### Infrastructure
- ✅ FastAPI backend with SQLite database
- ✅ JWT authentication + RBAC dependencies
- ✅ Celery background tasks (in-memory broker, eager mode)
- ✅ CLIP AI integration for vector search
- ✅ Static file serving for uploads
- ✅ CORS for frontend-backend communication
- ✅ React Frontend with Vite + JSX
- ✅ Tailwind CSS + inline styles (design-compliant components)

---

## 🔴 Critical Bugs

### 1. Token Key Inconsistency (Fixed)
**Issue:** MatchModal, StudentDashboard, and AdminPage were using `localStorage.getItem('token')`, but `useAuth()` hook stored token as `'authToken'`. This caused auth to silently fail.

**Fix Applied:** All components now use `localStorage.getItem('authToken')`.

**Risk:** Low — already fixed in latest commit.

---

## 🟡 Partially Implemented Features

### 1. Item Match Score Display
**Status:** Backend generates `match_scores` but frontend UI doesn't display them.

**Backend:** `items` endpoint returns `match_scores`: `[{"objects": [...], "bboxes": [...], "score": 0.85, "label": "description"}]`

**Frontend:**
- ✅ `transformItem()` in `App.jsx` extracts `matchScores` field
- ❌ No UI component to show match scores in item grid
- ❌ StudentDashboard item cards don't display confidence
- ❌ No "AI-matched" badge on related items

**Impact:** Users can't see AI recommendations; claim submission is not AI-driven visually.

**Workaround:** AdminPage shows AI score in the Claims table, but this is only for resolved claims, not live recommendations.

---

### 2. My Posts Tab (StudentDashboard)
**Status:** Tab exists but doesn't filter user's own items.

**Current Behavior:**
- `My Posts` tab shows all items with No Match badge, no filtering.

**Expected Behavior:**
- Should filter items created by the logged-in user.

**Why Not Fixed:**
- Need `currentUser.id` in StudentDashboard to filter by `item.reported_by`
- Backend `/api/items/` doesn't filter by user; would need new endpoint `/api/items/my`

**Impact:** Low — customers can still see all posts but confusion about which are theirs.

---

### 3. Match Modal AI Recommendations
**Status:** MatchModal exists but doesn't prompt user to select matching items from AI results.

**Current Behavior:**
- MatchModal shows "Secret Proof Verification Question" but doesn't list AI matches.

**Expected Behavior:**
- After selecting an item, show "This matches 3 other items":
  - Item A (85% match) → Show image + secret question
  - Item B (79% match) → Show image
  - Item C (72% match) → Show image

**Why Not Fixed:**
- Need to fetch `/api/items/{id}/match-result` endpoint
- Need "Minor Match" modal UI component
- Need to update flow: User sees matching items → clicks → secret verification

**Impact:** Medium — users can't receive AI-powered match recommendations.

---

### 4. User Profile Page
**Status:** Backend has `/api/auth/profile` and `/users` endpoints; frontend shows user info in sidebar but no profile view.

**Current Behavior:**
- StudentDashboard sidebar shows user avatar + name with "Logout" button.
- No way to edit profile, avatar, or view claim history.

**Expected Behavior:**
- Profile edit modal or page
- Avatar upload preview
- Claim history table

**Why Not Fixed:**
- No dedicated profile route in `App.jsx`
- Profile modal component not created
- Avatar upload endpoint exists but UI missing

**Impact:** Low — nice to have for long-term platform growth.

---

### 5. Claims Email Notifications
**Status:** Backend endpoints exist (`/api/claims/submit`, `/api/claims/approve`), but no email sending implemented.

**Current Behavior:**
- Claims submitted, approved, rejected are saved to database.
- No notifications to claimants about status changes.

**Expected Behavior:**
- Email sent to claimant when:
  - Claim is submitted
  - Claim is approved/verified
  - Item is returned

**Why Not Fixed:**
- No `EmailService` class configured
- SMTP settings not configured
- Would need `celery.task` for async sending

**Impact:** Medium — users can't follow up on their claims without manual checks.

---

### 6. Image Upload Preview
**Status:** Image upload endpoint exists (`/api/items/lost` with multipart FormData), but no preview UI in forms.

**Current Behavior:**
- "New Post" modal lets user enter details but can't attach images.

**Expected Behavior:**
- Image file input with preview
- Drag-and-drop upload area
- Format validation (jpg, png, max 5MB)

**Why Not Fixed:**
- UI component not created
- Form state for `imageFile` not added
- Handling of image URLs in `transformItem()` shows existing data but no upload UI

**Impact:** Medium — users can't upload photos with items, reducing match reliability.

---

### 7. Return Item Flow
**Status:** Backend has `/api/claims/{id}/return` endpoint, but no UI component to trigger it.

**Current Behavior:**
- Admin can mark claim as "Approved/Verified" → item enters "returned" status.
- No step to physically mark as returned to claimant.

**Expected Behavior:**
- After claim approved:
  - User clicks "Return to Claimant"
  - Item still tracked as returned
  - Claim status updates to "Returned"

**Why Not Fixed:**
- AdminPage batch action "Return to Claimant" button missing
- No separate workflow for reconciling returned items

**Impact:** Low — still trackable in database, just no UI trigger.

---

## 🟢 Nice-to-Have Features

### 1. Duplicate Detection
- Automatically flag items with identical titles, descriptions, and categories
- Show "This item already exists" warning
- Backend could check `SELECT * FROM items WHERE title = ? AND status IN (lost, found) AND date > ?`

### 2. Advanced Search Filters
- Date range filter (from: X to: Y)
- Category sub-filter (e.g., 'Wallets > Student ID')
- Price range filter (for valued items like laptops)
- Keyword search + exact match toggle

### 3. Claim Templates
- Pre-fill secret proof questions based on item category
  - Labs → "What lab is this from?"
  - Gym → "Which gym bag color?"
- Reduce user error on verification

### 4. Mobile App
- React Native mobile app
- Push notifications for claims status
- Barcode/QR scan for item scanning

### 5. Admin Analytics Dashboard
- Charts for:
  - Items found vs lost trend over time
  - Top lost categories (electronics, documents, etc.)
  - Verification success rate
  - Claim resolution time

### 6. Multi-language Support
- i18n with strings in `locales/`
- Display UI in English, Tagalog, etc.

### 7. Dark/Light Mode Toggle
- Persist theme preference
- Different color schemes for accessibility

---

## 🔧 Technical Debt

### 1. Hardcoded URLs
**Issue:** All components use `http://localhost:8000` hardcoded.

**Fix:** Use `VITE_API_URL` env variable or central config.

**Example:**
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

**Impact:** Medium — can't deploy to staging/production.

---

### 2. Duplicate Item Endpoints
**Issue:** `/api/items/lost` and `/api/items/found` duplicate `/api/items/`.

**Fix:** Consolidate into `/api/items` with query param: `items?status=lost`.

**Impact:** Low — RESTful inconsistency, no heavy impact.

---

### 3. Mock Data in Claimants
**Issue:** `AdminPage` fetches claims and hardcodes claimant names as `User #id`.

**Fix:** Use `/api/auth/users` or `/api/users/{id}` to get real user names.

**Option 1:** Too slow (N+1 queries)
**Option 2:** Fetch all users at once and join.

**Impact:** Medium — Admin sees "User #3" instead of "Maria Santos".

---

### 4. No Error Boundaries
**Issue:** If `transformItem()` crashes, entire item list breaks.

**Fix:** Add `try-catch` in `loadItems()` and render error UI.

---

### 5. No Pagination
**Issue:** `loadItems()` fetches up to 50 items at once.

**Fix:** Add `page` and `size` query params, implement infinite scroll or pagination.

**Impact:** Low — 50 items is small enough; upgrades when data grows.

---

## 📝 TODO Items (Short-term)

1. **Fix item match score UI**
   - Add "AI Match" badge to matching items in dashboard
   - Show packed-in list of 3 best matches with confidence %

2. **Implement "My Posts" filtering**
   - Pass `currentUser.id` to StudentDashboard
   - Filter items with `item.reported_by === currentUser.id`

3. **Add image upload preview**
   - Add `<input type="file" accept="image/*">` to "New Post" modal
   - Preview uploaded image in form
   - Include image in FormData submission

4. **Connect Admin "Return to Claimant"**
   - Add modal with confirmation: "Return this {item} to {claimant}?"
   - Submit to `/api/claims/{id}/return` and update UI

5. **Add claim history for user profile**
   - Fetch user's claims from `/api/claims/?status_in=pending,approved,returned`
   - Display table with item + claimant info

---

## 🏗️ Architecture Notes

### Backend
- **Database:** SQLite (`agp.db`)
- **ORM:** SQLModel
- **Auth:** JWT with OAuth2PasswordBearer
- **Workload Managers:** Celery (in-memory broker)
- **AI Model:** CLIP for image embeddings

**Key Files:**
```
app/
├── api/
│   ├── items.py        # CRUD + CLIP embedding
│   ├── claims.py       # Submit, approve, reject, return
│   ├── admin.py        # Stats + metrics
│   └── auth.py         # Login, register, profile
├── core/
│   ├── config.py       # Settings (in-memory broker)
│   ├── dependencies.py # JWT + RBAC
│   └── security.py     # Hash passwords, decode token
├── db/
│   ├── models.py       # User, Item, Claim, Match
│   ├── session.py      # DB session factory
│   └── seed.py         # 12 dummy items
├── workers/
│   ├── tasks.py        # Celery async tasks (generate embeddings)
│   └── consumers.py    # Match sweep worker
└── main.py             # FastAPI app entry
```

### Frontend
- **Framework:** React 18
- **Build:** Vite
- **Styling:** Tailwind CSS + inline styles
- **Router:** React Router (underlying in App.jsx structure)

**Key Files:**
```
src/
├── App.jsx             # Main routing & auth
├── components/
│   ├── RedesignedLanding.jsx      # Landing page
│   ├── StudentDashboard.jsx       # Student view + reporting
│   ├── AdminPage.jsx              # Admin view + claim management
│   ├── Shared.jsx                 # Modals (MatchModal, AssistantDrawer)
│   └── hooks/
│       └── useAuth.js             # Auth state manager
├── services/
│   └── api.js                      # Backend API client (currently unused)
├── styles/
│   └── global.css                  # Tailwind + custom styles
└── main.jsx                        # React entry point
```

---

## 🚀 Deployment Notes

### Current Environment
- **Backend:** Python 3.14, FastAPI, in-memory Celery
- **Frontend:** Vite, React, Lightning CSS
- **Database:** SQLite (file-based)
- **AI:** CLIP model (PyTorch)
- **Celery:** `celery -A app.workers.tasks worker --loglevel=info --pool=solo`

### Required for Production
1. **Docker containerization**
   - Backend: `Dockerfile` with uvicorn + celery workers
   - Frontend: `Dockerfile` for vite build output

2. **Redis as Celery broker**
   - Replace memory broker with Redis
   - Redis configuration: `.env` file

3. **PostgreSQL database**
   - Replace SQLite with PostgreSQL for better concurrency
   - Migrate `agp.db` to schema files

4. **WSL with SMTP**
   - Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
   - Use `python-dotenv` for env vars

5. **CDN for images**
   - S3 or Cloudflare R2
   - Replace `uploads/` local storage with cloud storage

6. **Environment variables**
   ```bash
   VITE_API_URL=http://localhost:8000
   DATABASE_URL=sqlite:///agp.db
   REDIS_URL=memory://
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=u[email]
   ...

---

## 📊 Current Database Schema

```sql
-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'staff', 'admin'))
);

-- Items
CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('electronics', 'clothing', 'accessory', 'document', 'other')),
  status TEXT CHECK (status IN ('lost', 'found', 'claimed', 'verified', 'returned')),
  location TEXT,
  date_reported DATETIME DEFAULT CURRENT_TIMESTAMP,
  image_urls JSON,
  user_id INTEGER,
  match_scores JSON,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Claims
CREATE TABLE claims (
  id INTEGER PRIMARY KEY,
  item_id INTEGER,
  claimant_id INTEGER,
  status TEXT CHECK (status IN ('pending', 'claimed', 'verified', 'returned')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (claimant_id) REFERENCES users(id)
);

-- Match Results
CREATE TABLE match (
  id INTEGER PRIMARY KEY,
  item_id INTEGER,
  predict_text TEXT,
  predict_bboxes JSON,
  top_k_object_bboxes JSON,
  predict_captions JSON,
  predicted_classes JSON,
  FOREIGN KEY (item_id) REFERENCES items(id)
);
```

---

## 🧪 Testing Status

### Implemented Tests
- None created yet.

### Recommended Tests
1. Integration tests for `/api/claims/submit`, `/api/claims/approve`, `/api/claims/reject`
2. Unit tests for `transformItem()` in App.jsx
3. Auth tests: JWT validation, RBAC (STAFF should see all claims)
4. Item creation tests with image upload
5. Celery tasks tests (embedding generation)

---

## 🤝 Recommendations

### Priority 1 (Do this week)
1. Add image upload preview and validation
2. Implement "My Posts" filtering
3. Show match scores in item display

### Priority 2 (Do next week)
1. Connect AdminPage to claim history for users
2. Add email notifications for claim status (even if basic)
3. Fix duplicate item endpoints to RESTful standard

### Priority 3 (Do when scaling)
1. Switch to PostgreSQL + Redis
2. Add pagination for items list
3. Implement email with correct SMTP

---

## 📞 Support & Maintenance

### Contact
- For bugs: Check this file first
- For feature requests: Create GitHub issue

### Logging
- Backend logs: Terminal output of uvicorn
- Frontend logs: Browser console (F12)

### Backup
- Database: Copy `agp.db` to backup location
- Currently: No daily backups configured

---

**End of Document**