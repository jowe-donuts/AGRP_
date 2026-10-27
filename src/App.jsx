import React, { useState, useEffect } from 'react';
import StudentPage from './components/StudentPage';
import AdminPage from './components/AdminPage';
import { MatchModal, AssistantDrawer, AiPhotoMatchModal } from './components/Shared';
import { Shield, User, Sparkles, Camera, LogOut, Loader } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { api } from './services/api';

// Login Component
function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isRegister) {
        result = await register(email, password, fullName);
      } else {
        result = await login(email, password);
      }

      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">Ay, Gamit Ko 'To!</h1>
          <p className="text-slate-400">Campus Lost & Found Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required={isRegister}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@campus.edu"
              required
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {isRegister ? 'Creating Account...' : 'Logging in...'}
              </>
            ) : (
              isRegister ? 'Create Account' : 'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-violet-400 hover:text-violet-300 font-semibold"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-xs">
            <strong>Demo Account:</strong> Use any email with password "Test123456" or create a new account
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, token, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [currentRole, setCurrentRole] = useState('student');
  const [selectedMatchItem, setSelectedMatchItem] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isPhotoMatchOpen, setIsPhotoMatchOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState('');
  const [claims, setClaims] = useState([]);

  // Load items from backend when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      loadItems();
      if (user?.role === 'admin' || user?.role === 'staff') {
        loadClaims();
      }
    }
  }, [isAuthenticated, token, user]);

  // Load items from backend
  const loadItems = async () => {
    setItemsLoading(true);
    setError('');
    try {
      const result = await api.items.list({ size: 50 });
      setItems(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Failed to load items:', err);
      setError('Failed to load items');
      // Use demo data as fallback
      setItems([
        {
          id: 1,
          title: 'MacBook Air M2 (Space Gray)',
          category: 'Electronics',
          location: 'CS Library 3rd Floor',
          date: 'Today, 10:15 AM',
          status: 'lost',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
          description: 'Found on study desk near power outlet',
        },
      ]);
    } finally {
      setItemsLoading(false);
    }
  };

  // Load claims from backend
  const loadClaims = async () => {
    try {
      const result = await api.claims.list(token);
      setClaims(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Failed to load claims:', err);
    }
  };

  // Report new item
  const handleReportNewItem = async (itemData) => {
    if (!token) {
      setError('You must be logged in to report an item');
      return;
    }

    try {
      // Convert item data to FormData for API
      const formData = new FormData();
      formData.append('title', itemData.title);
      formData.append('description', itemData.description || '');
      formData.append('category', itemData.category || 'electronics');
      formData.append('location', itemData.location || '');
      formData.append('color', itemData.color || '');
      formData.append('brand', itemData.brand || '');

      const endpoint = itemData.type === 'LOST' ? 'reportLost' : 'reportFound';
      const result = await api.items[endpoint](token, formData);

      // Add new item to list
      if (result.id) {
        setItems([...items, result]);
        setError('');
      }
    } catch (err) {
      console.error('Failed to report item:', err);
      setError('Failed to report item: ' + err.message);
    }
  };

  // Handle claim submission
  const handleAddNewClaim = async (itemId) => {
    if (!token) {
      setError('You must be logged in to submit a claim');
      return;
    }

    try {
      const result = await api.claims.submit(token, itemId);
      if (result.id) {
        setClaims([...claims, result]);
        setSelectedMatchItem(null);
        setError('');
      }
    } catch (err) {
      console.error('Failed to submit claim:', err);
      setError('Failed to submit claim: ' + err.message);
    }
  };

  // Handle claim status update
  const handleUpdateClaimStatus = async (claimId, status) => {
    if (!token) return;

    try {
      let result;
      if (status === 'approved') {
        result = await api.claims.approve(token, claimId);
      } else if (status === 'rejected') {
        result = await api.claims.reject(token, claimId);
      } else if (status === 'returned') {
        result = await api.claims.return(token, claimId);
      }

      // Update local state
      setClaims(claims.map(c => c.id === claimId ? result : c));
    } catch (err) {
      console.error('Failed to update claim status:', err);
      setError('Failed to update claim: ' + err.message);
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated || authLoading) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      );
    }
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  return (
    <div className="w-full">
      {/* Header with User Info & Logout */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold">{user?.full_name}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Role Selector (for demo, only for staff/admin) */}
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            >
              <option value="student">Student View</option>
              <option value="admin">Admin View</option>
            </select>
          )}

          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {itemsLoading && (
        <div className="mx-6 mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 flex items-center gap-2">
          <Loader className="w-4 h-4 animate-spin" />
          Loading items from backend...
        </div>
      )}

      {/* Main Content */}
      {currentRole === 'student' ? (
        <StudentPage
          items={items}
          onReportNewItem={handleReportNewItem}
          onOpenMatchModal={(item) => setSelectedMatchItem(item)}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenPhotoMatch={() => setIsPhotoMatchOpen(true)}
        />
      ) : (
        <AdminPage
          claims={claims}
          onUpdateClaimStatus={handleUpdateClaimStatus}
        />
      )}

      {/* Modals */}
      {selectedMatchItem && (
        <MatchModal
          item={selectedMatchItem}
          onClose={() => setSelectedMatchItem(null)}
          onSubmitClaim={handleAddNewClaim}
        />
      )}

      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {isPhotoMatchOpen && (
        <AiPhotoMatchModal
          items={items}
          onClose={() => setIsPhotoMatchOpen(false)}
          onOpenMatchModal={(item) => {
            setIsPhotoMatchOpen(false);
            setSelectedMatchItem(item);
          }}
        />
      )}
    </div>
  );
}
