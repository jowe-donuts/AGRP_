import React, { useState } from 'react';
import { Search, Plus, LogOut, Eye, Home, Package, Settings } from 'lucide-react';
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
      {/* Content area */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: '#f9fafb',
        borderRight: '1px solid #e5e7eb',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 68px)'
      }}>
        {/* Logo/Title */}
        <div style={{ paddingLeft: '24px', paddingRight: '24px', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0, marginBottom: '4px' }}>Gamit</h1>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Lost & Found</p>
        </div>

        {/* Report Button */}
        <button
          onClick={() => setShowReportModal(true)}
          style={{
            marginLeft: '12px',
            marginRight: '12px',
            marginBottom: '24px',
            background: '#fe7141',
            color: '#000000',
            border: 'none',
            padding: '12px 16px',
            fontSize: '13px',
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
          <Plus style={{ width: '16px', height: '16px' }} />
          New Post
        </button>

        {/* Navigation */}
        <nav style={{ paddingLeft: '12px', paddingRight: '12px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a href="#" style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', backgroundColor: '#fe7141', color: '#000000', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
            <Home style={{ width: '16px', height: '16px' }} />
            Feed
          </a>
          <a href="#" style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px', color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
            <Package style={{ width: '16px', height: '16px' }} />
            My Posts
          </a>
        </nav>

        {/* Categories */}
        <div style={{ paddingLeft: '12px', paddingRight: '12px', marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: '12px', paddingLeft: '8px', margin: '0 0 12px 0' }}>Categories</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  border: 'none',
                  background: selectedCategory === cat ? '#fe7141' : 'transparent',
                  color: selectedCategory === cat ? '#000000' : '#6b7280',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ paddingLeft: '12px', paddingRight: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', borderRadius: '4px', padding: '10px 12px', border: '1px solid #e5e7eb' }}>
            <Search style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              style={{ flex: 1, background: 'none', border: 'none', color: '#000000', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* User Profile at Bottom */}
        <div style={{ marginTop: 'auto', paddingLeft: '12px', paddingRight: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '16px', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#fe7141',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '16px',
              color: '#ffffff',
              flexShrink: 0
            }}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#000000' }}>{user?.full_name}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            style={{
              width: '100%',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              color: '#dc2626',
              padding: '10px 12px',
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
            aria-label="Logout"
          >
            <LogOut style={{ width: '14px', height: '14px' }} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '280px', flex: 1, padding: '32px' }}>
        <div style={{ maxWidth: '1000px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.05em', margin: 0, marginBottom: '8px', textTransform: 'uppercase' }}>
              {selectedCategory === 'All' ? 'All Items' : selectedCategory}
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Items Grid - Small Containers */}
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#000000' }}>No items found</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Try a different category or search term</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
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
                      style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  )}

                  {/* Content */}
                  <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Badge */}
                    {item.type && (
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        fontSize: '9px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        borderRadius: '2px',
                        backgroundColor: item.type === 'LOST' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                        color: item.type === 'LOST' ? '#dc2626' : '#16a34a',
                        marginBottom: '8px',
                        width: 'fit-content'
                      }}>
                        {item.type}
                      </span>
                    )}

                    {/* Title */}
                    <h3 style={{ fontSize: '13px', fontWeight: 700, margin: 0, marginBottom: '4px', color: '#000000', lineHeight: 1.3 }}>{item.title}</h3>

                    {/* Location */}
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, marginBottom: '6px' }}>📍 {item.location}</p>

                    {/* Date */}
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, marginBottom: '8px' }}>📅 {item.date || 'Recently'}</p>

                    {/* Match score if available */}
                    {item.matchScore && (
                      <div style={{ padding: '4px 6px', backgroundColor: 'rgba(22, 163, 74, 0.1)', borderRadius: '2px', color: '#16a34a', fontSize: '10px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>
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
                        padding: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontFamily: 'inherit',
                        marginTop: 'auto'
                      }}
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
      </div>

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
