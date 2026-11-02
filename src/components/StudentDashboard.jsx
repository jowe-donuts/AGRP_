import React, { useState } from 'react';
import { Search, Plus, LogOut, Eye, ArrowRight } from 'lucide-react';
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
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0, marginBottom: '4px' }}>Campus Lost & Found</h1>
          <p style={{ fontSize: '12px', color: '#9a8f97', margin: 0 }}>AI-powered recovery platform</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ff488b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>{user?.full_name?.charAt(0).toUpperCase()}</div>
            <div style={{ fontSize: '13px' }}>
              <div style={{ fontWeight: 700 }}>{user?.full_name}</div>
              <div style={{ color: '#9a8f97', fontSize: '11px' }}>{user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            style={{ background: '#ff488b', color: '#0d060b', border: 'none', padding: '10px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit' }}
            aria-label="Logout"
          >
            <LogOut style={{ width: '14px', height: '14px' }} />
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px 28px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Title & CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.1, margin: 0, marginBottom: '8px', textTransform: 'lowercase' }}>your items</h2>
              <p style={{ fontSize: '16px', color: '#9a8f97', margin: 0 }}>Track posts, view matches, and connect with finders</p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              style={{ background: '#ff488b', color: '#0d060b', border: 'none', padding: '14px 28px', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              Post Item
            </button>
          </div>

          {/* Search & Filter */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1b0e17', border: '1px solid #470c35', borderRadius: '4px', padding: '12px 16px' }}>
                <Search style={{ width: '16px', height: '16px', color: '#9a8f97' }} />
                <input
                  type="search"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  style={{ flex: 1, background: 'none', border: 'none', color: '#ffffff', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    border: selectedCategory === cat ? 'none' : '1px solid #470c35',
                    background: selectedCategory === cat ? '#ff488b' : '#1b0e17',
                    color: selectedCategory === cat ? '#0d060b' : '#ffffff',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#1b0e17', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>No items found</h3>
              <p style={{ fontSize: '14px', color: '#9a8f97' }}>Try adjusting your search or post a new item to get started</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#1b0e17',
                    border: '1px solid #470c35',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ff488b';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#470c35';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  )}

                  {/* Content */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Badge */}
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        borderRadius: '2px',
                        backgroundColor: item.type === 'LOST' ? '#ff488b' : '#1b0e17',
                        color: item.type === 'LOST' ? '#0d060b' : '#ff488b',
                        border: item.type === 'FOUND' ? '1px solid #ff488b' : 'none'
                      }}>
                        {item.type}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, marginBottom: '8px', color: '#ffffff' }}>{item.title}</h3>

                    {/* Description */}
                    <p style={{ fontSize: '13px', color: '#9a8f97', margin: 0, marginBottom: '12px', flex: 1, lineHeight: 1.5 }}>{item.description}</p>

                    {/* Meta */}
                    <div style={{ fontSize: '12px', color: '#9a8f97', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>📍 {item.location}</div>
                      <div>📅 {item.date || 'Recently'}</div>
                    </div>

                    {/* Match score if available */}
                    {item.matchScore && (
                      <div style={{ padding: '8px 12px', backgroundColor: 'rgba(22, 163, 74, 0.1)', border: '1px solid #16a34a', borderRadius: '2px', color: '#16a34a', fontSize: '12px', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>
                        {item.matchScore} MATCH
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => onOpenMatchModal(item)}
                      style={{ width: '100%', background: '#ff488b', color: '#0d060b', border: 'none', padding: '10px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'inherit' }}
                    >
                      <Eye style={{ width: '14px', height: '14px' }} />
                      View & Claim
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1b0e17', borderRadius: '4px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(255, 72, 139, 0.2)', position: 'relative' }}>
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #470c35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Report Item</h2>
              <button
                onClick={() => setShowReportModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9a8f97', fontFamily: 'inherit' }}
                aria-label="Close modal"
              >
                X
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Item Type */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', color: '#ffffff' }}>Item Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'LOST' })}
                    style={{
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      borderRadius: '4px',
                      border: 'none',
                      background: formData.type === 'LOST' ? '#ff488b' : '#0d060b',
                      color: formData.type === 'LOST' ? '#0d060b' : '#ffffff',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}
                  >
                    Lost Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'FOUND' })}
                    style={{
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      borderRadius: '4px',
                      border: 'none',
                      background: formData.type === 'FOUND' ? '#ff488b' : '#0d060b',
                      color: formData.type === 'FOUND' ? '#0d060b' : '#ffffff',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}
                  >
                    Found Item
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#ffffff' }} htmlFor="title">Title</label>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#ffffff' }} htmlFor="category">Category</label>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#ffffff' }} htmlFor="location">Location</label>
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#ffffff' }} htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Color, brand, distinguishing features..."
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
                  style={{ padding: '10px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', border: '1px solid #470c35', background: '#0d060b', color: '#ffffff', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', border: 'none', background: '#ff488b', color: '#0d060b', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} />
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
