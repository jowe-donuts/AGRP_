import React, { useState } from 'react';
import { 
  ShieldCheck, Users, AlertCircle, CheckCircle2, XCircle, 
  Search, Filter, Sparkles, ArrowUpRight, Clock, ShieldAlert 
} from 'lucide-react';

export default function AdminPage({ claims, onUpdateClaimStatus }) {
  const [adminTab, setAdminTab] = useState('claims'); // 'claims' | 'users'
  const [searchQuery, setSearchQuery] = useState('');

  const metrics = [
    { title: 'Total Active Lost', count: '48', change: '+12% this week', icon: AlertCircle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { title: 'Surrendered Items', count: '32', change: '8 pending claim', icon: ShieldCheck, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { title: 'AI Match Accuracy', count: '94.2%', change: '+1.4% model update', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Successfully Returned', count: '128', change: 'This semester', icon: Users, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  ];

  const students = [
    { id: 'STU-2024-1092', name: 'Maria Santos', email: 'm.santos@university.edu', claimsCount: 2, status: 'Active' },
    { id: 'STU-2023-4412', name: 'Juan dela Cruz', email: 'j.delacruz@university.edu', claimsCount: 1, status: 'Active' },
    { id: 'STU-2025-0811', name: 'Ana Reyes', email: 'a.reyes@university.edu', claimsCount: 3, status: 'Active' },
  ];

  const filteredClaims = claims.filter(c => 
    c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-20 w-full">
      {/* Full-width Admin Header Banner */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900/40 via-[#07090e] to-[#07090e] px-6 lg:px-12 py-12 w-full">
        <div className="absolute top-0 right-1/4 w-[600px] h-[250px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" /> Campus Asset Control Center
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Admin Control Hub</h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Verify ownership claims using secret proof validation, monitor surrendered item inventory, and oversee student directory accounts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-4 py-2 rounded-2xl font-bold flex items-center gap-2 backdrop-blur-md shadow-lg shadow-emerald-500/5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> System Online (v1.00)
            </span>
          </div>
        </div>
      </div>

      <main className="w-full px-6 lg:px-12 mt-8">
        {/* Metric Cards Grid */}
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

        {/* Tab Switcher & Search */}
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
              Claim Verification Queue ({claims.filter(c => c.status === 'Pending').length})
            </button>
            <button 
              onClick={() => setAdminTab('users')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                adminTab === 'users' 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student Directory
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search claims, student names, or items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/80 transition backdrop-blur-md shadow-inner"
            />
          </div>
        </div>

        {/* Tab 1: Claim Verification Queue */}
        {adminTab === 'claims' && (
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl w-full">
            <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-950/40">
              <div>
                <h3 className="font-bold text-white text-lg">Pending Ownership Verification Requests</h3>
                <p className="text-xs text-slate-400 mt-0.5">Admin approval requires verifying student responses against hidden ownership prompts.</p>
              </div>
              <span className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 px-3 py-1 rounded-full font-medium">
                Secure Validation Enabled
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/60">
                    <th className="p-5">Claimant / Student</th>
                    <th className="p-5">Item Name</th>
                    <th className="p-5">Secret Proof Answer</th>
                    <th className="p-5">AI Confidence</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredClaims.map((claim) => (
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
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        {claim.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2.5">
                            <button 
                              onClick={() => onUpdateClaimStatus(claim.id, 'Approved')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </button>
                            <button 
                              onClick={() => onUpdateClaimStatus(claim.id, 'Rejected')}
                              className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-500/30"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                          </div>
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
        )}

        {/* Tab 2: User Directory */}
        {adminTab === 'users' && (
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl w-full">
            <div className="p-6 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/40">
              <div>
                <h3 className="font-bold text-white text-lg">Registered Student Accounts</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time synchronization with institutional directory database.</p>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-medium border border-slate-700/50">
                Active Directory Synced
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/60">
                    <th className="p-5">Student ID</th>
                    <th className="p-5">Full Name</th>
                    <th className="p-5">Institutional Email</th>
                    <th className="p-5">Claims Logged</th>
                    <th className="p-5">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-5 font-mono text-xs text-violet-400">{stu.id}</td>
                      <td className="p-5 font-semibold text-white">{stu.name}</td>
                      <td className="p-5 text-slate-300 font-mono text-xs">{stu.email}</td>
                      <td className="p-5 text-slate-300 font-medium">{stu.claimsCount} active claims</td>
                      <td className="p-5">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold inline-block">
                          {stu.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}