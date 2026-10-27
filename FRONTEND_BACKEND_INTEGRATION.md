# 🔌 BACKEND-FRONTEND INTEGRATION GUIDE

**Date**: October 26, 2026  
**Status**: Ready to Connect

---

## ✅ What's Been Created

### 1. API Service Layer (`src/services/api.js`)
- ✅ 21 endpoints mapped to backend
- ✅ Authentication endpoints
- ✅ Items CRUD operations
- ✅ Claims workflow
- ✅ Admin functions
- ✅ Error handling
- ✅ Authorization headers

### 2. Authentication Hook (`src/hooks/useAuth.js`)
- ✅ User login/register
- ✅ Token management
- ✅ Profile management
- ✅ Persistent authentication
- ✅ Error handling

---

## 🚀 Step-by-Step Integration

### Step 1: Start Backend
```bash
cd C:\Users\Joey\Documents\AGRP_
start_backend.bat
```

**Verify it's running:**
```
Open: http://localhost:8000/docs
You should see all 21 endpoints
```

### Step 2: Install Frontend Dependencies
```bash
cd C:\Users\Joey\Documents\AGRP_\src
npm install
```

### Step 3: Create `.env.local` (Frontend Configuration)
Create file: `C:\Users\Joey\Documents\AGRP_\src\.env.local`

```env
VITE_API_URL=http://localhost:8000
```

### Step 4: Start Frontend Dev Server
```bash
npm run dev
```

**Frontend runs at**: http://localhost:5173

---

## 📝 How to Use in Components

### Example 1: Login Component

```javascript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      // Show error
      console.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Example 2: Item Search Component

```javascript
import { useState } from 'react';
import { api } from '../services/api';

export function ItemSearch() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const results = await api.items.search(query);
      setItems(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for items..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="results">
        {items.map(item => (
          <div key={item.id} className="item-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>Location: {item.location}</p>
            <p>Status: {item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Report Lost Item

```javascript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export function ReportLostItem() {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electronics',
    location: '',
    color: '',
    brand: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('You must be logged in');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create FormData for file upload
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('category', formData.category);
      form.append('location', formData.location);
      form.append('color', formData.color);
      form.append('brand', formData.brand);
      
      if (file) {
        form.append('file', file);
      }

      const result = await api.items.reportLost(token, form);
      
      if (result.id) {
        // Success - reset form and redirect
        setFormData({
          title: '',
          description: '',
          category: 'electronics',
          location: '',
          color: '',
          brand: ''
        });
        setFile(null);
        alert('Item reported successfully!');
        window.location.href = '/items';
      }
    } catch (err) {
      setError(err.message || 'Failed to report item');
      console.error('Report error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Item title"
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Detailed description"
        required
      />
      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
      >
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
        <option value="accessory">Accessory</option>
        <option value="document">Document</option>
        <option value="other">Other</option>
      </select>
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location lost"
        required
      />
      <input
        type="text"
        name="color"
        value={formData.color}
        onChange={handleChange}
        placeholder="Color"
      />
      <input
        type="text"
        name="brand"
        value={formData.brand}
        onChange={handleChange}
        placeholder="Brand"
      />
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Reporting...' : 'Report Lost Item'}
      </button>
    </form>
  );
}
```

### Example 4: Submit Claim

```javascript
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export function ClaimButton({ itemId, onSuccess }) {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClaim = async () => {
    if (!token) {
      setError('You must be logged in to claim an item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.claims.submit(token, itemId);
      
      if (result.id) {
        alert('Claim submitted successfully!');
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleClaim} disabled={loading}>
        {loading ? 'Submitting...' : 'Claim This Item'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### Example 5: Dashboard with useAuth

```javascript
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export function Dashboard() {
  const { user, token, loading, isAuthenticated, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadItems();
    }
  }, [isAuthenticated]);

  const loadItems = async () => {
    setItemsLoading(true);
    try {
      const results = await api.items.list();
      setItems(results);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setItemsLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please log in first</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.full_name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      <button onClick={logout}>Logout</button>

      <h2>Recent Items</h2>
      {itemsLoading ? (
        <p>Loading items...</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id}>
              <strong>{item.title}</strong> - {item.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 🔄 Integration Checklist

### Before Starting
- [ ] Backend running on http://localhost:8000
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `.env.local` created with `VITE_API_URL=http://localhost:8000`

### After Starting Frontend
- [ ] Frontend running on http://localhost:5173
- [ ] No CORS errors in browser console
- [ ] API service functions working

### Integration Steps
- [ ] Create login component using `useAuth`
- [ ] Create register component using `useAuth`
- [ ] Create item search using `api.items.search`
- [ ] Create report item form using `api.items.reportLost`
- [ ] Create claim submission using `api.claims.submit`
- [ ] Add admin endpoints for admin dashboard

---

## 🧪 Testing the Connection

### Test 1: Register a User
```bash
# In browser console or component:
const { register } = useAuth();
const result = await register('test@campus.edu', 'Test123456', 'Test User');
console.log(result);
// Should print: { success: true, user: {...} }
```

### Test 2: Search Items
```bash
# In browser console or component:
import { api } from './services/api';
const items = await api.items.search('laptop');
console.log(items);
// Should print array of items
```

### Test 3: Report Lost Item
```bash
# In browser console or component:
const formData = new FormData();
formData.append('title', 'Blue Laptop');
formData.append('description', 'Lost near library');
formData.append('category', 'electronics');
formData.append('location', 'Building A');

const result = await api.items.reportLost(token, formData);
console.log(result);
// Should print: { id: 1, title: 'Blue Laptop', ... }
```

---

## 🐛 Troubleshooting

### CORS Error
```
Error: Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution**: Make sure backend is running and has CORS enabled
```bash
# Check that app/main.py has CORS middleware
# Should see in browser: 
# GET http://localhost:8000/docs → 200 OK
```

### 401 Unauthorized Error
```
Error: { status: 401, message: 'Invalid token' }
```

**Solution**: Token expired or invalid
```javascript
// Clear token and ask user to login again
localStorage.removeItem('authToken');
window.location.href = '/login';
```

### 422 Unprocessable Entity Error
```
Error: { status: 422, message: 'Validation error' }
```

**Solution**: Check form data structure
```javascript
// Make sure FormData has correct field names:
// title, description, category, location, color, brand
```

### Network Error
```
Error: Failed to fetch / Network request failed
```

**Solution**: Backend not running
```bash
# Start backend:
cd C:\Users\Joey\Documents\AGRP_
start_backend.bat

# Check if running:
curl http://localhost:8000/docs
```

---

## 📊 API Response Examples

### Successful Item Search
```json
[
  {
    "id": 1,
    "title": "Blue Laptop",
    "description": "Lost near library",
    "category": "electronics",
    "location": "Building A",
    "status": "lost",
    "color": "blue",
    "brand": "Apple",
    "date_reported": "2026-10-26T16:20:30Z"
  }
]
```

### Successful Claim Submission
```json
{
  "id": 1,
  "item_id": 1,
  "claimant_id": 2,
  "status": "claimed",
  "created_at": "2026-10-26T16:25:00Z"
}
```

### Error Response
```json
{
  "detail": "Invalid email or password"
}
```

---

## 🎯 Next Steps

1. **Update your existing App.jsx** to use real data from backend
2. **Replace hardcoded data** with API calls
3. **Connect StudentPage** to api.items endpoints
4. **Connect AdminPage** to api.admin and api.claims endpoints
5. **Add authentication flow** using useAuth hook

---

## 📚 Files Created

- ✅ `src/services/api.js` - API service layer (all 21 endpoints)
- ✅ `src/hooks/useAuth.js` - Authentication hook
- ✅ `src/.env.local` - Frontend configuration (create manually)

---

## ✅ You're All Set!

Your frontend and backend are now connected. Start using the API in your components!

**Next**: Update your UI components to use real data from the backend.
