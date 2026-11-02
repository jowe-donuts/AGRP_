import React, { useState } from 'react';
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
    <div style={{ backgroundColor: '#0d060b', color: '#ffffff', fontFamily: 'Cabinet Grotesk, -apple-system, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1b0e17', borderBottom: '1px solid #470c35', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ff488b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', color: '#0d060b' }}>
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', margin: 0 }}>{user?.full_name}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            window.location.reload();
          }}
          aria-label="Logout"
          style={{ background: 'none', border: '1px solid #ff488b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', color: '#ff488b', fontFamily: 'inherit', padding: '8px 12px', borderRadius: '4px', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 72, 139, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut style={{ width: '14px', height: '14px' }} />
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '60px 28px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {/* Hero Section */}
          <div style={{ marginBottom: '80px', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(48px, 8vw, 120px)', fontWeight: 800, lineHeight: 0.9, textTransform: 'lowercase', margin: 0, marginBottom: '24px', letterSpacing: '-0.035em' }}>
              {selectedCategory === 'All' ? 'your items' : selectedCategory.toLowerCase()}
            </h1>
            <p style={{ fontSize: '16px', color: '#9a8f97', margin: 0, maxWidth: '50ch' }}>
              {filteredItems.length === 0 
                ? 'No items found. Try a different category or search term.' 
                : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} available for recovery`}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '60px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1b0e17', borderRadius: '4px', padding: '12px 16px', border: '1px solid #470c35' }}>
              <Search style={{ width: '16px', height: '16px', color: '#9a8f97' }} />
              <input
                type="search"
                placeholder="Search items…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                aria-label="Search items"
                style={{ flex: 1, background: 'none', border: 'none', color: '#ffffff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', placeholder: '#9a8f97' }}
              />
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              aria-label="Report a new item"
              style={{ background: '#ff488b', color: '#0d060b', border: 'none', padding: '12px 24px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 72, 139, 0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Report
            </button>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '60px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                style={{
                  padding: '10px 18px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  border: selectedCategory === cat ? 'none' : '1px solid #470c35',
                  background: selectedCategory === cat ? '#ff488b' : 'transparent',
                  color: selectedCategory === cat ? '#0d060b' : '#9a8f97',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background-color 0.2s, color 0.2s, border-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.borderColor = '#ff488b';
                    e.currentTarget.style.color = '#ff488b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.borderColor = '#470c35';
                    e.currentTarget.style.color = '#9a8f97';
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: '#1b0e17', borderRadius: '4px', border: '1px solid #470c35' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>No matches yet</h3>
              <p style={{ fontSize: '14px', color: '#9a8f97', margin: 0 }}>Try searching or browsing other categories to find what you're looking for.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#1b0e17',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid #470c35',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, border-color 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.borderColor = '#ff488b';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#470c35';
                  }}
                >
                  {/* Image */}
                  {item.image && (
                    <div style={{ position: 'relative', paddingBottom: '125%', overflow: 'hidden', backgroundColor: '#470c35' }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                      />
                      <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: item.type === 'LOST' ? '#ff488b' : '#1b0e17', color: item.type === 'LOST' ? '#0d060b' : '#ff488b', padding: '4px 10px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', border: item.type === 'FOUND' ? '1px solid #ff488b' : 'none', borderRadius: '2px' }}>
                        {item.type}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, marginBottom: '8px', color: '#ffffff', lineHeight: 1.3 }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: '12px', color: '#9a8f97', margin: 0, marginBottom: '6px' }}>
                      📍 {item.location}
                    </p>

                    <p style={{ fontSize: '12px', color: '#9a8f97', margin: 0, marginBottom: '12px' }}>
                      📅 {item.date || 'Recently'}
                    </p>

                    {item.matchScore && (
                      <div style={{ padding: '6px 8px', backgroundColor: 'rgba(255, 72, 139, 0.15)', borderRadius: '2px', color: '#ff488b', fontSize: '11px', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>
                        {item.matchScore} MATCH
                      </div>
                    )}

                    <button
                      onClick={() => onOpenMatchModal(item)}
                      aria-label={`View details for ${item.title}`}
                      style={{
                        width: '100%',
                        background: '#ff488b',
                        color: '#0d060b',
                        border: 'none',
                        padding: '10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontFamily: 'inherit',
                        marginTop: 'auto',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                      <Eye style={{ width: '12px', height: '12px' }} />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overscrollBehavior: 'contain' }}>
          <div style={{ backgroundColor: '#1b0e17', borderRadius: '4px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(255, 72, 139, 0.2)', position: 'relative', border: '1px solid #470c35' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #470c35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: '#ffffff', letterSpacing: '-0.035em' }}>Report Item</h2>
              <button
                onClick={() => setShowReportModal(false)}
                aria-label="Close modal"
                style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#9a8f97', fontFamily: 'inherit', padding: '0', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ff488b'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9a8f97'; }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Item Type */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px', color: '#9a8f97', letterSpacing: '0.05em' }}>Item Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'LOST' })}
                    aria-pressed={formData.type === 'LOST'}
                    style={{
                      padding: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      borderRadius: '4px',
                      border: 'none',
                      background: formData.type === 'LOST' ? '#ff488b' : '#470c35',
                      color: formData.type === 'LOST' ? '#0d060b' : '#9a8f97',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background-color 0.2s, color 0.2s'
                    }}
                  >
                    Lost
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'FOUND' })}
                    aria-pressed={formData.type === 'FOUND'}
                    style={{
                      padding: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      borderRadius: '4px',
                      border: 'none',
                      background: formData.type === 'FOUND' ? '#ff488b' : '#470c35',
                      color: formData.type === 'FOUND' ? '#0d060b' : '#9a8f97',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background-color 0.2s, color 0.2s'
                    }}
                  >
                    Found
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#9a8f97', letterSpacing: '0.05em' }} htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="e.g., Black iPhone 14 Pro"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #470c35', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#0d060b', color: '#ffffff' }}
                />
              </div>

              {/* Category & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#9a8f97', letterSpacing: '0.05em' }} htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #470c35', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#0d060b', color: '#ffffff' }}
                  >
                    <option>Electronics</option>
                    <option>Wallets</option>
                    <option>Bags</option>
                    <option>Keys</option>
                    <option>IDs & Cards</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#9a8f97', letterSpacing: '0.05em' }} htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    required
                    placeholder="e.g., Library, 3rd Floor"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #470c35', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#0d060b', color: '#ffffff' }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#9a8f97', letterSpacing: '0.05em' }} htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Color, brand, distinguishing features…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #470c35', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#0d060b', color: '#ffffff', minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #470c35' }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  style={{ padding: '10px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', border: '1px solid #470c35', background: 'transparent', color: '#9a8f97', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s, border-color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ff488b'; e.currentTarget.style.borderColor = '#ff488b'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9a8f97'; e.currentTarget.style.borderColor = '#470c35'; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', border: 'none', background: '#ff488b', color: '#0d060b', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} />
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
