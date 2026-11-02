import React, { useState } from 'react';
import { Search, Plus, LogOut, Eye, Zap, TrendingUp, Users } from 'lucide-react';
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
      {/* Header with gradient accent */}
      <header style={{
        backgroundColor: '#1b0e17',
        borderBottom: '2px solid #ff488b',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 8px 32px rgba(255, 72, 139, 0.15)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{ fontSize: '24px' }}>🎯</div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', margin: 0 }}>Gamit Dashboard</h1>
          </div>
          <p style={{ fontSize: '12px', color: '#ff488b', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI-Powered Recovery</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '24px', borderRight: '1px solid #470c35' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff488b 0%, #fe7141 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px' }}>{user?.full_name?.charAt(0).toUpperCase()}</div>
            <div style={{ fontSize: '13px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{user?.full_name}</div>
              <div style={{ color: '#9a8f97', fontSize: '11px' }}>{user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.reload();
            }}
            style={{
              background: 'rgba(255, 72, 139, 0.2)',
              border: '1px solid #ff488b',
              color: '#ff488b',
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff488b';
              e.currentTarget.style.color = '#0d060b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 72, 139, 0.2)';
              e.currentTarget.style.color = '#ff488b';
            }}
            aria-label="Logout"
          >
            <LogOut style={{ width: '14px', height: '14px' }} />
            Logout
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ backgroundColor: '#1b0e17', padding: '16px 28px', borderBottom: '1px solid #470c35', display: 'flex', gap: '40px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: '20px' }}>📦</div>
          <div>
            <div style={{ fontSize: '12px', color: '#9a8f97', textTransform: 'uppercase', fontWeight: 600 }}>Your Posts</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#ff488b' }}>{items.length || 0}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}>
          <TrendingUp style={{ width: '20px', height: '20px', color: '#16a34a' }} />
          <div>
            <div style={{ fontSize: '12px', color: '#9a8f97', textTransform: 'uppercase', fontWeight: 600 }}>Match Rate</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a' }}>87%</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}>
          <Users style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
          <div>
            <div style={{ fontSize: '12px', color: '#9a8f97', textTransform: 'uppercase', fontWeight: 600 }}>Connections</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#fbbf24' }}>3.2K</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main style={{ flex: 1, padding: '40px 28px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Hero section with personality */}
          <div style={{
            background: 'linear-gradient(135deg, #470c35 0%, #1b0e17 100%)',
            borderRadius: '8px',
            padding: '40px',
            marginBottom: '40px',
            border: '1px solid #ff488b',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              fontSize: '120px',
              opacity: 0.1,
              pointerEvents: 'none'
            }}>🎯</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Zap style={{ width: '24px', height: '24px', color: '#ff488b' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff488b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Start</span>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.05em', margin: 0, marginBottom: '8px' }}>Ready to find something?</h2>
              <p style={{ fontSize: '16px', color: '#9a8f97', margin: 0, marginBottom: '20px' }}>Post your item or browse recent finds. Our AI will match you in minutes.</p>
              <button
                onClick={() => setShowReportModal(true)}
                style={{
                  background: '#ff488b',
                  color: '#0d060b',
                  border: 'none',
                  padding: '14px 28px',
                  fontSize: '14px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Plus style={{ width: '18px', height: '18px' }} />
                Post New Item
              </button>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, letterSpacing: '-0.05em', margin: 0, marginBottom: '4px', textTransform: 'lowercase' }}>browse items</h3>
            <p style={{ fontSize: '14px', color: '#9a8f97', margin: 0 }}>Search, filter, and connect with finders or losers on campus</p>
          </div>

          {/* Search & Filter */}
          <div style={{ marginBottom: '32px', backgroundColor: '#1b0e17', padding: '20px', borderRadius: '8px', border: '1px solid #470c35' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#0d060b',
                border: '2px solid #470c35',
                borderRadius: '6px',
                padding: '12px 16px',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#ff488b';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#470c35';
              }}
              >
                <Search style={{ width: '18px', height: '18px', color: '#ff488b', flexShrink: 0 }} />
                <input
                  type="search"
                  placeholder="Search by item name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    '::placeholder': { color: '#9a8f97' }
                  }}
                />
              </div>
            </div>

            {/* Categories - with emoji */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { name: 'All', emoji: '🎯' },
                { name: 'Electronics', emoji: '📱' },
                { name: 'Wallets', emoji: '👛' },
                { name: 'Bags', emoji: '🎒' },
                { name: 'Keys', emoji: '🔑' },
                { name: 'IDs & Cards', emoji: '🆔' }
              ].map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    border: selectedCategory === cat.name ? '2px solid #ff488b' : '1px solid #470c35',
                    background: selectedCategory === cat.name ? 'rgba(255, 72, 139, 0.15)' : '#0d060b',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat.name) {
                      e.currentTarget.style.borderColor = '#ff488b';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat.name) {
                      e.currentTarget.style.borderColor = '#470c35';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{cat.emoji}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: '#1b0e17',
              borderRadius: '8px',
              border: '2px dashed #470c35'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>No items found</h3>
              <p style={{ fontSize: '14px', color: '#9a8f97', marginBottom: '20px' }}>Try adjusting your search or be the first to post in this category!</p>
              <button
                onClick={() => setShowReportModal(true)}
                style={{
                  background: '#ff488b',
                  color: '#0d060b',
                  border: 'none',
                  padding: '10px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Post Item
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#1b0e17',
                    border: '1px solid #470c35',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    animation: `fadeInUp 0.5s ease-out ${idx * 50}ms both`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ff488b';
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 72, 139, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#470c35';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Image with overlay */}
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.3s ease-out'
                        }}
                        loading="lazy"
                      />
                    )}
                    {/* Badge overlay */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'inline-block',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      borderRadius: '4px',
                      backgroundColor: item.type === 'LOST' ? '#ff488b' : '#1b0e17',
                      color: item.type === 'LOST' ? '#0d060b' : '#16a34a',
                      border: item.type === 'FOUND' ? '2px solid #16a34a' : 'none',
                      letterSpacing: '0.05em'
                    }}>
                      {item.type === 'LOST' ? '🔍 Lost' : '✓ Found'}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Title */}
                    <h3 style={{ fontSize: '16px', fontWeight: 900, margin: 0, marginBottom: '6px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{item.title}</h3>

                    {/* Description */}
                    <p style={{ fontSize: '13px', color: '#9a8f97', margin: 0, marginBottom: '12px', flex: 1, lineHeight: 1.5 }}>{item.description || 'No details provided'}</p>

                    {/* Meta with icons */}
                    <div style={{ fontSize: '12px', color: '#9a8f97', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📍</span> {item.location}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📅</span> {item.date || 'Recently'}
                      </div>
                    </div>

                    {/* Match score with animation */}
                    {item.matchScore && (
                      <div style={{
                        padding: '10px 12px',
                        backgroundColor: 'rgba(22, 163, 74, 0.15)',
                        border: '2px solid #16a34a',
                        borderRadius: '4px',
                        color: '#16a34a',
                        fontSize: '12px',
                        fontWeight: 800,
                        marginBottom: '12px',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                        <Zap style={{ width: '14px', height: '14px' }} />
                        {item.matchScore} Match
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => onOpenMatchModal(item)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #ff488b 0%, #fe7141 100%)',
                        color: '#0d060b',
                        border: 'none',
                        padding: '12px',
                        fontSize: '13px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s',
                        letterSpacing: '0.05em'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Eye style={{ width: '16px', height: '16px' }} />
                      View & Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Report Modal with personality */}
      {showReportModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{
            backgroundColor: '#1b0e17',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(255, 72, 139, 0.3)',
            position: 'relative',
            border: '2px solid #ff488b'
          }}>
            {/* Header with gradient */}
            <div style={{
              padding: '20px',
              borderBottom: '2px solid #ff488b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #470c35 0%, #1b0e17 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📝</span>
                <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Report Item</h2>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#9a8f97',
                  fontFamily: 'inherit',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ff488b'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9a8f97'; }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Item Type with personality */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px', color: '#ffffff', letterSpacing: '0.05em' }}>
                  <span>🔎</span> Item Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'LOST' })}
                    style={{
                      padding: '14px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      borderRadius: '4px',
                      border: formData.type === 'LOST' ? '2px solid #ff488b' : '1px solid #470c35',
                      background: formData.type === 'LOST' ? '#ff488b' : '#0d060b',
                      color: formData.type === 'LOST' ? '#0d060b' : '#ffffff',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      fontSize: '14px'
                    }}
                  >
                    🔍 Lost Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'FOUND' })}
                    style={{
                      padding: '14px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      borderRadius: '4px',
                      border: formData.type === 'FOUND' ? '2px solid #16a34a' : '1px solid #470c35',
                      background: formData.type === 'FOUND' ? 'rgba(22, 163, 74, 0.15)' : '#0d060b',
                      color: formData.type === 'FOUND' ? '#16a34a' : '#ffffff',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      fontSize: '14px'
                    }}
                  >
                    ✓ Found Item
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#ffffff', letterSpacing: '0.05em' }} htmlFor="title">
                  <span>📌</span> Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="e.g., Black iPhone 14 Pro"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #470c35',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    backgroundColor: '#0d060b',
                    color: '#ffffff',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#ff488b'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#470c35'; }}
                />
              </div>

              {/* Category & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#ffffff', letterSpacing: '0.05em' }} htmlFor="category">
                    <span>📂</span> Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #470c35',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      backgroundColor: '#0d060b',
                      color: '#ffffff',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#ff488b'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#470c35'; }}
                  >
                    <option>Electronics</option>
                    <option>Wallets</option>
                    <option>Bags</option>
                    <option>Keys</option>
                    <option>IDs & Cards</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#ffffff', letterSpacing: '0.05em' }} htmlFor="location">
                    <span>📍</span> Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    required
                    placeholder="e.g., Library, 3rd Floor"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #470c35',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      backgroundColor: '#0d060b',
                      color: '#ffffff',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#ff488b'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#470c35'; }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#ffffff', letterSpacing: '0.05em' }} htmlFor="description">
                  <span>✍️</span> Description
                </label>
                <textarea
                  id="description"
                  placeholder="Color, brand, distinguishing features... be specific!"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #470c35',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    backgroundColor: '#0d060b',
                    color: '#ffffff',
                    minHeight: '100px',
                    resize: 'vertical',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#ff488b'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#470c35'; }}
                />
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #470c35' }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  style={{
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    border: '1px solid #470c35',
                    background: '#0d060b',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ff488b';
                    e.currentTarget.style.color = '#ff488b';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#470c35';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff488b 0%, #fe7141 100%)',
                    color: '#0d060b',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Plus style={{ width: '14px', height: '14px' }} />
                  Submit Report
                </button>
              </div>
            </form>
          </div>

          <style>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
