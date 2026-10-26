import React, { useState } from 'react';
import { 
  Search, PlusCircle, ShieldAlert, Sparkles, MapPin, 
  Calendar, Upload, ArrowRight, Eye, X, Camera
} from 'lucide-react';

export default function StudentPage({ items, onReportNewItem, onOpenMatchModal, onOpenAssistant, onOpenPhotoMatch }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('feed'); 
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [reportType, setReportType] = useState('LOST');
  const [itemTitle, setItemTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [secretProof, setSecretProof] = useState('');

  const categories = ['All', 'Electronics', 'Wallets', 'Bags', 'Keys', 'IDs & Cards'];

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateReport = (e) => {
    e.preventDefault();
    const newItem = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      title: itemTitle,
      category,
      location,
      date: date || 'Today',
      type: reportType,
      status: reportType === 'LOST' ? 'Searching' : 'Unclaimed',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      matchScore: reportType === 'LOST' ? '88%' : null,
      description,
      secretProof
    };
    onReportNewItem(newItem);
    setIsReportModalOpen(false);
    setItemTitle('');
    setLocation('');
    setDate('');
    setDescription('');
    setSecretProof('');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-20 w-full">
      {/* Full-width Hero Header Banner */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-violet-950/20 via-[#07090e] to-[#07090e] px-6 lg:px-12 py-12 w-full">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-violet-600/10 blur-[140px] rounded-full pointer-events-none"></div>
        
        <div className="w-full relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Next-Gen Visual & Spatial AI Matching
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
              Ay, Gamit Ko 'To!
            </h1>
            <p className="text-slate-400 text-base max-w-2xl">
              Intelligent campus asset recovery. Report lost items or claim surrendered belongings with high-accuracy AI verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button 
              onClick={onOpenPhotoMatch}
              className="flex-1 md:flex-none bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 px-5 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition shadow-lg backdrop-blur-md"
            >
              <Camera className="w-4 h-4 text-violet-400" /> AI Photo Match Studio
            </button>
            <button 
              onClick={onOpenAssistant}
              className="flex-1 md:flex-none bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-violet-300 px-5 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition shadow-lg backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-violet-400" /> Ask FindIt AI
            </button>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="flex-1 md:flex-none bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 shadow-xl shadow-violet-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" /> Report Item
            </button>
          </div>
        </div>
      </div>

      <main className="w-full px-6 lg:px-12 mt-8">
        {/* Premium AI Match Alert Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 p-6 mb-8 shadow-2xl backdrop-blur-xl w-full">
          <div className="absolute top-0 right-0 w-64 h-full bg-amber-500/5 blur-3xl pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 mt-0.5 shadow-inner">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] px-3 py-0.5 rounded-full font-bold tracking-wider">
                    92% HIGH CONFIDENCE MATCH
                  </span>
                  <span className="text-xs text-slate-400">Verified 10 mins ago</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Black iPhone 14 Pro matches a recently surrendered item at CS Library</h3>
                <p className="text-slate-300 text-sm">Visual spatial embeddings and serial number check indicate high probability match.</p>
              </div>
            </div>
            <button 
              onClick={() => onOpenMatchModal(items[0])}
              className="whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/25 transform hover:-translate-y-0.5"
            >
              Verify & Claim <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Navigation Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-8 w-full">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('feed')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'feed' 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Campus Feed
            </button>
            <button 
              onClick={() => setActiveTab('my-reports')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'my-reports' 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Reports & Claims
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search items, keywords, or buildings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/20 transition backdrop-blur-md shadow-inner"
            />
          </div>
        </div>

        {/* Category Pills */}
        {activeTab === 'feed' && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-none w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-semibold' 
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80 backdrop-blur-md'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Full-width Item Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {filteredItems.map(item => (
            <div key={item.id} className="group bg-slate-900/70 border border-slate-800/80 rounded-3xl overflow-hidden hover:border-violet-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-600/10 flex flex-col justify-between backdrop-blur-xl">
              <div>
                <div className="relative h-56 overflow-hidden bg-slate-950">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-lg ${
                      item.type === 'LOST' ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-emerald-400 text-slate-950 shadow-emerald-400/30'
                    }`}>
                      {item.type}
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/50 text-[11px] px-3 py-1 rounded-full font-medium">
                      {item.category}
                    </span>
                  </div>

                  {item.matchScore && (
                    <div className="absolute bottom-4 right-4 bg-violet-600/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-lg shadow-violet-600/30 border border-violet-400/30">
                      <Sparkles className="w-3.5 h-3.5" /> {item.matchScore} Match
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">{item.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed">{item.description}</p>
                  
                  <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-violet-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">ID: {item.id}</span>
                <button 
                  onClick={() => onOpenMatchModal(item)}
                  className="bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-violet-500/30 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" /> View & Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-2xl">
            <button 
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2.5 rounded-full bg-slate-800/50 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-1">Create Lost / Found Report</h2>
            <p className="text-slate-400 text-sm mb-6">Fill out details so our AI vision system can match items automatically.</p>

            <form onSubmit={handleCreateReport} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Report Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReportType('LOST')}
                    className={`py-3 rounded-2xl text-sm font-bold border transition-all ${
                      reportType === 'LOST' 
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/10' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    I Lost Something
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportType('FOUND')}
                    className={`py-3 rounded-2xl text-sm font-bold border transition-all ${
                      reportType === 'FOUND' 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    I Found Something
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Item Title / Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Apple AirPods Pro with Case"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition shadow-inner"
                  >
                    <option>Electronics</option>
                    <option>Wallets</option>
                    <option>Bags</option>
                    <option>Keys</option>
                    <option>IDs & Cards</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Date</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Oct 26, 2026"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Campus Location</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., 2nd Floor Hallway, CS Building"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Provide color, brand, distinct scratches, or contents..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Secret Ownership Proof Question</label>
                <input 
                  type="text" 
                  placeholder="e.g., What sticker is on the back case?"
                  value={secretProof}
                  onChange={(e) => setSecretProof(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition shadow-inner"
                />
              </div>

              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-violet-500/50 transition cursor-pointer bg-slate-950/40">
                <Upload className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">Upload Item Photo</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB (AI Vision Feature Extraction enabled)</p>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-violet-600/30"
                >
                  Submit Report & Run AI Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}