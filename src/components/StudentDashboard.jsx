import React, { useState } from 'react';
import { Search, Plus, LogOut, Eye, Home, Package } from 'lucide-react';
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

        <button
          onClick={() => {
            logout();
            window.location.reload();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 min-h-screen">
          {/* Logo */}
          <div className="mb-8">
            <h2 className="text-white text-lg font-bold uppercase">Gamit</h2>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Lost & Found</p>
          </div>

          {/* New Post Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mb-6 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            <a href="#" className="block px-4 py-2 bg-violet-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2">
              <Home className="w-4 h-4" />
              Feed
            </a>
            <a href="#" className="block px-4 py-2 text-slate-400 hover:text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors">
              <Package className="w-4 h-4" />
              My Posts
            </a>
          </nav>

          {/* Categories */}
          <div className="mb-8">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-3">Categories</p>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedCategory === cat
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-sm"
              />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 bg-slate-950">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white uppercase tracking-tight mb-2">
              {selectedCategory === 'All' ? 'All Items' : selectedCategory}
            </h1>
            <p className="text-slate-400">{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found</p>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 rounded-lg border border-slate-800">
              <h3 className="text-white font-semibold mb-2">No items found</h3>
              <p className="text-slate-400 text-sm">Try a different category or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-violet-500 transition-all cursor-pointer group"
                >
                  {/* Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-32 object-cover group-hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                  )}

                  {/* Content */}
                  <div className="p-3">
                    {/* Badge */}
                    {item.type && (
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${
                        item.type === 'LOST'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {item.type}
                      </span>
                    )}

                    {/* Title */}
                    <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{item.title}</h3>

                    {/* Location */}
                    <p className="text-slate-400 text-xs mb-1">📍 {item.location}</p>

                    {/* Date */}
                    <p className="text-slate-400 text-xs mb-3">📅 {item.date || 'Recently'}</p>

                    {/* Match score */}
                    {item.matchScore && (
                      <div className="bg-green-500/20 text-green-400 text-xs font-bold py-1 px-2 rounded text-center mb-3">
                        {item.matchScore} MATCH
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => onOpenMatchModal(item)}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg max-w-md w-full p-6 border border-slate-800 shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white uppercase">Report Item</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Item Type */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2 uppercase">Item Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'LOST' })}
                    className={`py-2 px-3 rounded font-semibold text-sm transition-all ${
                      formData.type === 'LOST'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Lost
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'FOUND' })}
                    className={`py-2 px-3 rounded font-semibold text-sm transition-all ${
                      formData.type === 'FOUND'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Found
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2 uppercase">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Black iPhone 14 Pro"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2 uppercase">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option>Electronics</option>
                    <option>Wallets</option>
                    <option>Bags</option>
                    <option>Keys</option>
                    <option>IDs & Cards</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2 uppercase">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Library, 3rd Floor"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2 uppercase">Description</label>
                <textarea
                  placeholder="Color, brand, distinguishing features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 min-h-20 resize-none"
                />
              </div>

              {/* Footer */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded font-semibold text-sm flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
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
