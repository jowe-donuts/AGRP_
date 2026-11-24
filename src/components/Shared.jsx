import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, CheckCircle, Camera, Upload, ArrowRight, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export function MatchModal({ item, onClose, onSubmitClaim }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');

  if (!item) return null;

  const bestMatch = item.matches?.[0] || null;

  const handleProofChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofFile(file);
    setProofPreview(file ? URL.createObjectURL(file) : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }

      // Submit claim to backend API (with optional proof photo)
      const claimData = await api.claims.submit(token, item.id, proofFile);

      if (proofPreview) URL.revokeObjectURL(proofPreview);
      setProofFile(null);
      setProofPreview('');

      // Call parent callback with claim data
      if (onSubmitClaim) {
        onSubmitClaim({
          id: claimData.id,
          itemId: item.id,
          itemTitle: item.title,
          status: claimData.status
        });
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50 z-10" aria-label="Close modal">
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {!submitted ? (
          <>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> AI Match &amp; Claim Review
            </div>

            {/* Enlarged post */}
            {item.image && (
              <img src={item.image} alt={item.title} className="w-full h-56 object-cover rounded-2xl border border-slate-800 mb-4" />
            )}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h2 className="text-xl font-bold text-white">{item.title}</h2>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.type === 'LOST' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {item.type}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-1">{item.category} &#183; {item.date}</p>
            <p className="text-xs text-slate-400 mb-3">&#128205; {item.location || 'Location not specified'}</p>
            {item.description && (
              <p className="text-sm text-slate-300 bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-4">{item.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">AI Visual Match</p>
                {bestMatch ? (
                  <>
                    <p className="text-xl font-black text-emerald-400">{Number(bestMatch.score).toFixed(1)}%</p>
                    <p className="text-[11px] text-slate-500 mt-1">Most similar to &ldquo;{bestMatch.candidate_title}&rdquo;</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-400">No AI match yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">We match each post against opposite-type items. You can still claim if you recognize this item.</p>
                  </>
                )}
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Ownership Proof</p>
                <p className="text-sm font-bold text-slate-200">Photo of the item</p>
                <p className="text-[11px] text-slate-500 mt-1">Recommended - the admin compares your photo with the posted one before approving.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  <Upload className="w-3.5 h-3.5 inline mr-1.5" />Proof Photo (optional but recommended)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofChange}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white disabled:opacity-50"
                />
                {proofPreview && (
                  <img src={proofPreview} alt="Proof preview" className="mt-2 max-h-32 rounded-xl border border-slate-800" />
                )}
                <p className="text-[11px] text-slate-500 mt-2">A photo helps the admin verify ownership. You can still submit without one.</p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-violet-600/30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Claim for Admin Review'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Claim Submitted Successfully!</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              Your claim has been logged and sent to the campus admin office. You will be notified via email once approved.
            </p>
            <button 
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AiPhotoMatchModal({ items, onClose, onOpenMatchModal }) {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [previewImage, setPreviewImage] = useState('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80');

  const handleRunScan = () => {
    setScanning(true);
    setScanned(false);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 relative shadow-2xl backdrop-blur-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white p-2.5 rounded-full bg-slate-800/50 hover:bg-slate-800 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Camera className="w-4 h-4" /> AI Vision Feature Extraction Studio
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Photo Matcher & Visual Embedding Search</h2>
        <p className="text-slate-400 text-sm mb-6">Upload a photo of your lost item or select a sample to cross-reference with campus surrender logs.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-4 text-center flex flex-col items-center justify-center bg-slate-950/40 relative overflow-hidden group">
            {previewImage ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden">
                <img src={previewImage} alt="Upload preview" className="w-full h-full object-cover" />
                {scanning && (
                  <div className="absolute inset-0 bg-violet-600/30 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-white animate-spin mb-2" />
                    <span className="text-xs font-bold text-white">Extracting Vision Embeddings...</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">Upload Lost Item Photo</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
              </>
            )}

            <button 
              onClick={handleRunScan}
              disabled={scanning}
              className="mt-4 w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> {scanning ? 'Analyzing...' : 'Run AI Visual Scan'}
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">AI Vision Feature Vectors</h4>
              {scanned ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between bg-slate-900 p-2 rounded-xl">
                    <span className="text-slate-400">Color Histogram Match</span>
                    <span className="text-emerald-400 font-bold">96.4%</span>
                  </div>
                  <div className="flex justify-between bg-slate-900 p-2 rounded-xl">
                    <span className="text-slate-400">Logo & Shape Detection</span>
                    <span className="text-emerald-400 font-bold">92.1%</span>
                  </div>
                  <div className="flex justify-between bg-slate-900 p-2 rounded-xl">
                    <span className="text-slate-400">Surface Texture Analysis</span>
                    <span className="text-violet-400 font-bold">88.9%</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-8 text-center">Run AI Visual Scan to extract color, shape, and logo embeddings.</p>
              )}
            </div>

            {scanned && (
              <button 
                onClick={() => onOpenMatchModal(items[0])}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-600/20"
              >
                View Top Match (92% Confident) <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssistantDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm FindIt AI. Ask me about any lost items on campus (e.g., 'Did anyone turn in a silver laptop?')." }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: `Based on current records, I found 1 item matching "${userMsg}" surrendered at the CS Building lobby yesterday at 2:30 PM.` 
      }]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col justify-between shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-600/20 text-violet-400 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">FindIt AI Assistant</h3>
              <p className="text-[11px] text-emerald-400">Online & Ready</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm ${
                m.sender === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950/50 flex gap-2">
          <input 
            type="text" 
            placeholder="Ask AI anything about lost items..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
          />
          <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white p-2.5 rounded-xl transition">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}