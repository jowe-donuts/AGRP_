import React, { useState, useEffect } from 'react';
import StudentDashboard from './components/StudentDashboard';
import AdminPage from './components/AdminPage';
import RedesignedLanding from './components/RedesignedLanding';
import { MatchModal, AssistantDrawer, AiPhotoMatchModal } from './components/Shared';
import { Loader, LogOut } from 'lucide-react';
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
                name={isRegister ? "fullName" : undefined}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required={isRegister}
                autoComplete={isRegister ? "name" : undefined}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@campus.edu"
              required
              autoComplete="email"
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              spellCheck={false}
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
                <Loader className="w-4 h-4 animate-spin" aria-label="Loading" />
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
      setItems(Array.isArray(result) ? result : getDummyItems());
    } catch (err) {
      console.error('Failed to load items:', err);
      setError('Failed to load items');
      // Use demo data as fallback
      setItems(getDummyItems());
    } finally {
      setItemsLoading(false);
    }
  };

  // Dummy data for display
  const getDummyItems = () => [
    {
      id: 1,
      type: 'LOST',
      title: 'Black iPhone 14 Pro',
      category: 'Electronics',
      location: 'Library, 3rd Floor',
      date: 'Oct 28',
      image: 'https://picsum.photos/id/669/400/500?grayscale',
      matchScore: '92%',
      description: 'Black iPhone 14 Pro with cracked screen protector'
    },
    {
      id: 2,
      type: 'FOUND',
      title: 'Sony WH-1000XM5 Headphones',
      category: 'Electronics',
      location: 'Student Center',
      date: 'Oct 27',
      image: 'https://picsum.photos/id/177/400/500?grayscale',
      matchScore: '78%',
      description: 'Black Sony noise-cancelling headphones'
    },
    {
      id: 3,
      type: 'LOST',
      title: 'Blue Kanken Backpack',
      category: 'Bags',
      location: 'CS Building',
      date: 'Oct 26',
      image: 'https://picsum.photos/id/338/400/500?grayscale',
      description: 'Navy blue Kanken backpack with laptop'
    },
    {
      id: 4,
      type: 'FOUND',
      title: 'Samsung Galaxy Watch 5',
      category: 'Electronics',
      location: 'Gym',
      date: 'Oct 25',
      image: 'https://picsum.photos/id/685/400/500?grayscale',
      matchScore: '85%',
      description: 'Silver Samsung Galaxy Watch 5 with strap'
    },
    {
      id: 5,
      type: 'LOST',
      title: 'Gold Class Ring',
      category: 'IDs & Cards',
      location: 'Science Building',
      date: 'Oct 24',
      image: 'https://picsum.photos/id/550/400/500?grayscale',
      description: 'Gold class ring with initials inside'
    },
    {
      id: 6,
      type: 'FOUND',
      title: 'Apple AirPods Pro (2nd Gen)',
      category: 'Electronics',
      location: 'Dorm',
      date: 'Oct 23',
      image: 'https://picsum.photos/id/665/400/500?grayscale',
      matchScore: '91%',
      description: 'White AirPods Pro in charging case'
    },
    {
      id: 7,
      type: 'LOST',
      title: 'Brown Leather Wallet',
      category: 'Wallets',
      location: 'Dining Hall',
      date: 'Oct 22',
      image: 'https://picsum.photos/id/445/400/500?grayscale',
      description: 'Brown leather wallet with ID and cards'
    },
    {
      id: 8,
      type: 'FOUND',
      title: 'Silver House Keys',
      category: 'Keys',
      location: 'Library Entrance',
      date: 'Oct 21',
      image: 'https://picsum.photos/id/315/400/500?grayscale',
      matchScore: '67%',
      description: 'Set of 3 silver keys on blue keychain'
    },
    {
      id: 9,
      type: 'LOST',
      title: 'Dell XPS 13 Laptop',
      category: 'Electronics',
      location: 'Coffee Shop',
      date: 'Oct 20',
      image: 'https://picsum.photos/id/88/400/500?grayscale',
      matchScore: '88%',
      description: 'Silver Dell XPS 13 with stickers'
    },
    {
      id: 10,
      type: 'FOUND',
      title: 'Red Backpack',
      category: 'Bags',
      location: 'Bus Stop',
      date: 'Oct 19',
      image: 'https://picsum.photos/id/236/400/500?grayscale',
      description: 'Bright red backpack with hiking gear'
    },
    {
      id: 11,
      type: 'LOST',
      title: 'Student ID Card',
      category: 'IDs & Cards',
      location: 'Main Campus',
      date: 'Oct 18',
      image: 'https://picsum.photos/id/407/400/500?grayscale',
      matchScore: '95%',
      description: 'Blue student ID with photo'
    },
    {
      id: 12,
      type: 'FOUND',
      title: 'AirTag',
      category: 'Electronics',
      location: 'Parking Lot',
      date: 'Oct 17',
      image: 'https://picsum.photos/id/544/400/500?grayscale',
      matchScore: '72%',
      description: 'White Apple AirTag with leather holder'
    }
  ];

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

  // Show redesigned landing if not authenticated
  if (!isAuthenticated || authLoading) {
    if (authLoading) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #fe7141',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#5f5f5f', fontSize: '14px' }}>Loading...</p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      );
    }
    return <RedesignedLanding />;
  }

  return (
    <div className="w-full">
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
        <StudentDashboard
          items={items}
          onReportNewItem={handleReportNewItem}
          onOpenMatchModal={(item) => setSelectedMatchItem(item)}
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
