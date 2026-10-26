import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, CheckCircle, Camera, Upload, ArrowRight, ShieldAlert } from 'lucide-react';

export function MatchModal({ item, onClose, onSubmitClaim }) {
  const [secretAnswer, setSecretAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitClaim({
      id: `CLM-${Date.now().toString().slice(-4)}`,
      studentName: 'Maria Santos',
      studentId: 'STU-2024-1092',
      itemId: item.id,
      itemTitle: item.title,
      secretAnswer,
      confidence: item.matchScore || '92%',
      status: 'Pending'
    });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50">
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> AI Visual & Spatial Match Breakdown
            </div>
            <h2 className="text-xl font-bold text-white mb-4">Ownership Verification for {item.title}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Visual Similarity</p>
                <p className="text-xl font-black text-emerald-400">96.4%</p>
                <p className="text-[11px] text-slate-500 mt-1">Color histogram & brand logo match</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Spatial Proximity</p>
                <p className="text-xl font-black text-violet-400">89.1%</p>
                <p className="text-[11px] text-slate-500 mt-1">Found 45m from reported lost zone</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Secret Proof Verification Question:
                </label>
                <p className="text-xs text-violet-300 italic bg-violet-950/30 p-3 rounded-xl border border-violet-800/30 mb-2">
                  "{item.secretProof || 'What specific distinguishing mark or sticker is attached?'}"
                </p>
                <input 
                  type="text"
                  required
                  placeholder="Enter your exact answer..."
                  value={secretAnswer}
                  onChange={(e) => setSecretAnswer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-violet-600/30"
              >
                Submit Claim for Admin Review
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