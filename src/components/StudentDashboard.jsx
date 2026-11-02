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
    <div style={{ backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Chivo, -apple-system, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>Campus Lost & Found</h1>
        <button
          onClick={() => {
            logout();
            window.location.reload();
          }}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            cursor: 'pointer',
            color: '#dc2626',
            fontFamily: 'inherit',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          aria-label="Logout"
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
          Logout
        </button>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px 28px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Title & CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.1, margin: 0, marginBottom: '8px', textTransform: 'uppercase' }}>Items</h2>
              <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>Search, filter, and connect with others</p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              style={{
                background: '#fe7141',
                color: '#000000',
                border: 'none',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'inherit'
              }}
            >
              <Plus style={{ width: '18px', height: '18px' }} />
              Report Item
            </button>
          </div>

          {/* Search & Filter */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', padding: '12px 16px' }}>
                <Search style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
                <input
                  type="search"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  style={{ flex: 1, background: 'none', border: 'none', color: '#000000', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
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
                    border: selectedCategory === cat ? 'none' : '1px solid #d1d5db',
                    background: selectedCategory === cat ? '#fe7141' : '#ffffff',
                    color: selectedCategory === cat ? '#000000' : '#000000',
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
            <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#000000' }}>No items found</h3>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>Try adjusting your search or post a new item</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#fe7141';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(254, 113, 65, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
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
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        borderRadius: '2px',
                        backgroundColor: item.type === 'LOST' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                        color: item.type === 'LOST' ? '#dc2626' : '#16a34a'
                      }}>
                        {item.type}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, marginBottom: '8px', color: '#000000' }}>{item.title}</h3>

                    {/* Description */}
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, marginBottom: '12px', flex: 1, lineHeight: 1.5 }}>{item.description}</p>

                    {/* Meta */}
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>📍 {item.location}</div>
                      <div>📅 {item.date || 'Recently'}</div>
                    </div>

                    {/* Match score if available */}
                    {item.matchScore && (
                      <div style={{ padding: '8px 12px', backgroundColor: 'rgba(22, 163, 74, 0.1)', border: '1px solid #d1d5db', borderRadius: '2px', color: '#16a34a', fontSize: '12px', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>
                        {item.matchScore} MATCH
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => onOpenMatchModal(item)}
                      style={{
                        width: '100%',
                        background: '#fe7141',
                        color: '#000000',
                        border: 'none',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontFamily: 'inherit'
                      }}
                    >
                      <Eye style={{ width: '14px', height: '14px' }} />
                      View Details
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)', position: 'relative' }}>
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Report Item</h2>
              <button
                onClick={() => setShowReportModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af', fontFamily: 'inherit' }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Item Type */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', color: '#000000' }}>Item Type</label>
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
                      border: formData.type === 'LOST' ? 'none' : '1px solid #d1d5db',
                      background: formData.type === 'LOST' ? '#fe7141' : '#ffffff',
                      color: formData.type === 'LOST' ? '#000000' : '#000000',
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
                      border: formData.type === 'FOUND' ? 'none' : '1px solid #d1d5db',
                      background: formData.type === 'FOUND' ? '#fe7141' : '#ffffff',
                      color: formData.type === 'FOUND' ? '#000000' : '#000000',
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#000000' }} htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="e.g., Black iPhone 14 Pro"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#ffffff', color: '#000000' }}
                />
              </div>

              {/* Category & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#000000' }} htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#ffffff', color: '#000000' }}
                  >
                    <option>Electronics</option>
                    <option>Wallets</option>
                    <option>Bags</option>
                    <option>Keys</option>
                    <option>IDs & Cards</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#000000' }} htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    required
                    placeholder="e.g., Library, 3rd Floor"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#ffffff', color: '#000000' }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#000000' }} htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Color, brand, distinguishing features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#ffffff', color: '#000000', minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  style={{ padding: '10px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', border: '1px solid #d1d5db', background: '#ffffff', color: '#000000', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', border: 'none', background: '#fe7141', color: '#000000', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
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
