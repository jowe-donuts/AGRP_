import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, AlertCircle, CheckCircle2, XCircle,
  Search, Sparkles, LogOut
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPage({ onUpdateClaimStatus, onLogout }) {
  const [adminTab, setAdminTab] = useState('claims');
  const [searchQuery, setSearchQuery] = useState('');
  const [claims, setClaims] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { loadClaims(); }, []);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const claimsData = await api.claims.list(token);
      
      // Extract unique claimant IDs
      const claimantIds = [...new Set(claimsData.map(c => c.claimant_id))];
      
      // Batch fetch all users in one request
      const usersData = claimantIds.length > 0 
        ? await api.auth.getUsersBatch(token, claimantIds)
        : [];
      
      // Create lookup map
      const usersMap = Object.fromEntries(usersData.map(u => [u.id, u]));

      // Enrich claims
      const enriched = claimsData.map((c) => {
        const user = usersMap[c.claimant_id];
        return {
          id: c.id,
          itemId: c.item_id,
          claimantId: c.claimant_id,
          studentName: user?.full_name || user?.email || `User #${c.claimant_id}`,
          studentId: `STU-${String(c.claimant_id).padStart(4, '0')}`,
          itemTitle: `${c.item_id}`,
          secretAnswer: 'Submitted via app',
          confidence: '92%',
          status: c.status === 'claimed' ? 'Pending'
                : c.status === 'verified' ? 'Approved'
                : c.status === 'returned' ? 'Returned'
                : c.status
        };
      });

      setClaims(enriched);
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (claimId, action) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setActionLoading(claimId);
    try {
      if (action === 'Approved') await api.claims.approve(token, claimId);
      else if (action === 'Rejected') await api.claims.reject(token, claimId);
      else if (action === 'Returned') await api.claims.return(token, claimId);
      await loadClaims();
    } catch (err) {
      console.error('Failed to update claim:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = claims.filter(c => c.status === 'Pending').length;

  const metrics = [
    { title: 'Total Claims', count: claims.length, change: 'All statuses', icon: AlertCircle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { title: 'Pending Review', count: pendingCount, change: 'Needs action', icon: ShieldCheck, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { title: 'Approved', count: claims.filter(c => c.status === 'Approved').length, change: 'Verified claims', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Returned', count: claims.filter(c => c.status === 'Returned').length, change: 'This semester', icon: Users, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  ];

  const filteredClaims = claims.filter(c => {
    const q = searchQuery.toLowerCase();
    return !q || c.studentName.toLowerCase().includes(q) || c.itemTitle.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-20 w-full">
      {/* Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#0a0c10] px-6 lg:px-12 py-4">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-violet-400" />
            <h1 className="text-xl font-bold">Admin Control Hub</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-semibold text-rose-400 hover:text-rose-300 transition"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="w-full px-6 lg:px-12 mt-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 flex items-center justify-between backdrop-blur-xl shadow-xl hover:border-violet-500/30 transition">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{m.title}</p>
                  <h4 className="text-3xl font-black text-white mt-2 mb-1">{m.count}</h4>
                  <p className="text-xs text-slate-500 font-medium">{m.change}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${m.color} shadow-inner`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8 w-full">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit backdrop-blur-md">
            <button
              onClick={() => setAdminTab('claims')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                adminTab === 'claims'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Claim Queue ({pendingCount})
            </button>
            <button
              onClick={() => setAdminTab('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                adminTab === 'all'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Claims ({claims.length})
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search claims or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/80 transition backdrop-blur-md shadow-inner"
            />
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl w-full">
          <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-950/40">
            <div>
              <h3 className="font-bold text-white text-lg">
                {adminTab === 'claims' ? 'Pending Ownership Verification' : 'All Claims'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {loading ? 'Loading from database...' : `${filteredClaims.length} claims found`}
              </p>
            </div>
            <span className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 px-3 py-1 rounded-full font-medium">
              Live Data
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/60">
                  <th className="p-5">Claimant</th>
                  <th className="p-5">Item</th>
                  <th className="p-5">Proof</th>
                  <th className="p-5">AI Score</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading claims...</td></tr>
                ) : (adminTab === 'claims' ? filteredClaims.filter(c => c.status === 'Pending') : filteredClaims).length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">No claims found</td></tr>
                ) : (adminTab === 'claims' ? filteredClaims.filter(c => c.status === 'Pending') : filteredClaims).map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-5 font-semibold text-white">
                      <div className="text-slate-100">{claim.studentName}</div>
                      <div className="text-xs text-violet-400 font-mono mt-0.5">{claim.studentId}</div>
                    </td>
                    <td className="p-5 text-slate-200">
                      <div className="font-medium">{claim.itemTitle}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {claim.itemId}</div>
                    </td>
                    <td className="p-5">
                      <span className="text-violet-200 font-mono text-xs bg-violet-950/50 px-3 py-1.5 rounded-xl border border-violet-800/30 inline-block">
                        "{claim.secretAnswer}"
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {claim.confidence}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                        claim.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        claim.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        claim.status === 'Returned' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {claim.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleAction(claim.id, 'Approved')}
                            disabled={actionLoading === claim.id}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(claim.id, 'Rejected')}
                            disabled={actionLoading === claim.id}
                            className="bg-rose-600/20 hover:bg-rose-600 disabled:opacity-50 text-rose-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-500/30"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      ) : claim.status === 'Approved' ? (
                        <button
                          onClick={() => handleAction(claim.id, 'Returned')}
                          disabled={actionLoading === claim.id}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition"
                        >
                          Mark Returned
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic font-medium px-3 py-1 bg-slate-950/40 rounded-lg">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}