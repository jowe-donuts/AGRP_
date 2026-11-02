import React, { useState } from 'react';
import '../styles/dashboard.css';
import { Search, Plus, LogOut, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function StudentDashboard({ items = [], onReportNewItem, onOpenMatchModal }) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showReportModal, setShowReportModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'LOST',
    title: '',
    category: 'Electronics',
    location: '',
    description: ''
  });

  const categories = ['All', 'Electronics', 'Wallets', 'Bags', 'Keys', 'IDs & Cards'];

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (item.location?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onReportNewItem({
      ...formData,
      id: `REP-${Date.now().toString().slice(-4)}`
    });
    setShowReportModal(false);
    setFormData({ type: 'LOST', title: '', category: 'Electronics', location: '', description: '' });
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Campus Lost & Found</h1>
        <div className="user-info">
          <div className="user-avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <p>{user?.full_name}</p>
            <p>{user?.email}</p>
          </div>
          <button
            className="btn btn-danger"
            onClick={() => {
              logout();
              window.location.reload();
            }}
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Sidebar */}
        <nav className="dashboard-sidebar">
          <ul className="sidebar-nav">
            <li><a href="#feed" className="active">Items Feed</a></li>
            <li><a href="#my-claims">My Claims</a></li>
            <li><a href="#stats">Statistics</a></li>
          </ul>
        </nav>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Search & Filter */}
          <div className="section-header" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Search className="w-4 h-4" />
                <input
                  type="search"
                  name="search"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1 }}
                  autoComplete="off"
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowReportModal(true)}
              >
                <Plus className="w-4 h-4" />
                Report Item
              </button>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <section className="section">
            <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
              {selectedCategory === 'All' ? 'All Items' : selectedCategory}
            </h2>

            {filteredItems.length === 0 ? (
              <div className="empty-state">
                <h3>No items found</h3>
                <p>Try adjusting your search or category filters</p>
              </div>
            ) : (
              <div className="grid grid-3">
                {filteredItems.map(item => (
                  <div key={item.id} className="card">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="card-image"
                        loading="lazy"
                      />
                    )}
                    <div className="badge" style={{
                      marginBottom: '12px'
                    }}>
                      <span className={`badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}`}>
                        {item.type}
                      </span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className="card-meta">
                      <span>📍 {item.location}</span>
                      <span>📅 {item.date || 'Recently'}</span>
                    </div>
                    {item.matchScore && (
                      <div className="badge badge-verified" style={{ marginTop: '12px' }}>
                        {item.matchScore} Match
                      </div>
                    )}
                    <div className="card-footer">
                      <button
                        className="btn btn-primary"
                        onClick={() => onOpenMatchModal(item)}
                        style={{ flex: 1 }}
                      >
                        <Eye className="w-4 h-4" />
                        View & Claim
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Report Lost / Found Item</h2>
              <button
                className="modal-close"
                onClick={() => setShowReportModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Item Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    className={`btn ${formData.type === 'LOST' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFormData({ ...formData, type: 'LOST' })}
                  >
                    Lost Item
                  </button>
                  <button
                    type="button"
                    className={`btn ${formData.type === 'FOUND' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFormData({ ...formData, type: 'FOUND' })}
                  >
                    Found Item
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="title">Item Title</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., Black iPhone 14 Pro"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Electronics</option>
                    <option>Wallets</option>
                    <option>Bags</option>
                    <option>Keys</option>
                    <option>IDs & Cards</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    required
                    placeholder="e.g., Library, 3rd Floor"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Color, brand, distinguishing features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
