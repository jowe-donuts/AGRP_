import React, { useState } from 'react';
import StudentPage from './components/StudentPage';
import AdminPage from './components/AdminPage';
import { MatchModal, AssistantDrawer, AiPhotoMatchModal } from './components/Shared';
import { Shield, User, Sparkles, Camera } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState('student');
  const [selectedMatchItem, setSelectedMatchItem] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isPhotoMatchOpen, setIsPhotoMatchOpen] = useState(false);

  const [items, setItems] = useState([
    {
      id: 'ITM-9021',
      title: 'MacBook Air M2 (Space Gray)',
      category: 'Electronics',
      location: 'CS Library 3rd Floor',
      date: 'Today, 10:15 AM',
      type: 'FOUND',
      status: 'Unclaimed',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      matchScore: '92%',
      description: 'Found on study desk near power outlet. Has a sticker of campus programming club.',
      secretProof: 'What club sticker is attached on the lid?'
    },
    {
      id: 'ITM-8832',
      title: 'Leather Bi-fold Wallet',
      category: 'Wallets',
      location: 'University Cafeteria',
      date: 'Yesterday',
      type: 'LOST',
      status: 'Searching',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
      matchScore: null,
      description: 'Brown genuine leather wallet containing student ID and transport cards.',
      secretProof: 'What initials are engraved inside the wallet?'
    },
    {
      id: 'ITM-7741',
      title: 'Herschel Supply Co. Backpack',
      category: 'Bags',
      location: 'Engineering Gymnasium',
      date: 'Oct 24, 2026',
      type: 'FOUND',
      status: 'Unclaimed',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      matchScore: '85%',
      description: 'Navy blue backpack containing scientific calculator and water tumbler.',
      secretProof: 'What brand is the water tumbler inside?'
    }
  ]);

  const [claims, setClaims] = useState([
    {
      id: 'CLM-1001',
      studentName: 'Maria Santos',
      studentId: 'STU-2024-1092',
      itemId: 'ITM-9021',
      itemTitle: 'MacBook Air M2 (Space Gray)',
      secretAnswer: 'ACM Programming Club Gold Badge',
      confidence: '92%',
      status: 'Pending'
    }
  ]);

  const handleReportNewItem = (newItem) => setItems([newItem, ...items]);
  const handleAddNewClaim = (newClaim) => setClaims([newClaim, ...claims]);
  const handleUpdateClaimStatus = (claimId, newStatus) => {
    setClaims(claims.map(c => c.id === claimId ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-violet-500 selection:text-white w-full overflow-x-hidden">
      {/* Full-width Sleek Frosted Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090e]/80 border-b border-slate-800/80 px-6 lg:px-12 py-4 w-full">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3.5">
            <div className="h-10 px-3 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20 text-white font-black tracking-wider text-xs border border-violet-400/30">
              AGRP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">Ay, Gamit Ko 'To!</span>
                <span className="text-[10px] bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-full font-medium tracking-wide">
                  Enterprise v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">AI Campus Intelligence Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPhotoMatchOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Camera className="w-4 h-4 text-violet-400" /> AI Photo Match
            </button>

            <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setCurrentRole('student')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                  currentRole === 'student' 
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Student Portal
              </button>
              <button
                onClick={() => setCurrentRole('admin')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                  currentRole === 'admin' 
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Admin Hub
              </button>
            </div>
          </div>
        </div>
      </nav>

      {currentRole === 'student' ? (
        <StudentPage 
          items={items} 
          onReportNewItem={handleReportNewItem} 
          onOpenMatchModal={(item) => setSelectedMatchItem(item)}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenPhotoMatch={() => setIsPhotoMatchOpen(true)}
        />
      ) : (
        <AdminPage 
          claims={claims} 
          onUpdateClaimStatus={handleUpdateClaimStatus}
        />
      )}

      {selectedMatchItem && (
        <MatchModal 
          item={selectedMatchItem} 
          onClose={() => setSelectedMatchItem(null)} 
          onSubmitClaim={handleAddNewClaim}
        />
      )}

      <AssistantDrawer 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)} 
      />

      {isPhotoMatchOpen && (
        <AiPhotoMatchModal 
          items={items}
          onClose={() => setIsPhotoMatchOpen(false)}
          onOpenMatchModal={(item) => {
            setIsPhotoMatchOpen(false);
            setSelectedMatchItem(item);
          }}
        />
      )}
    </div>
  );
}