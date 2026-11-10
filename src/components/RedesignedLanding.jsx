import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function RedesignedLanding() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = isRegister
        ? await register(email, password, fullName)
        : await login(email, password);
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sampleItems = [
    { id: 1, type: 'LOST', title: 'Black iPhone 14 Pro', location: 'Library, 3rd Floor', date: 'Oct 28', image: 'https://picsum.photos/id/669/400/500?grayscale' },
    { id: 2, type: 'FOUND', title: 'Sony Headphones', location: 'Student Center', date: 'Oct 27', image: 'https://picsum.photos/id/177/400/500?grayscale' },
    { id: 3, type: 'LOST', title: 'Blue Kanken Backpack', location: 'CS Building', date: 'Oct 26', image: 'https://picsum.photos/id/338/400/500?grayscale' },
    { id: 4, type: 'FOUND', title: 'Galaxy Watch 5', location: 'Gym', date: 'Oct 25', image: 'https://picsum.photos/id/685/400/500?grayscale' },
    { id: 5, type: 'LOST', title: 'Class Ring', location: 'Science Bldg', date: 'Oct 24', image: 'https://picsum.photos/id/550/400/500?grayscale' },
    { id: 6, type: 'FOUND', title: 'AirPods Pro', location: 'Dorm', date: 'Oct 23', image: 'https://picsum.photos/id/665/400/500?grayscale' }
  ];

  const openModal = (isReg) => {
    setShowModal(true);
    setIsRegister(isReg);
    setError('');
  };

  return (
    <div style={{ backgroundColor: '#0d060b', color: '#ffffff', fontFamily: 'Cabinet Grotesk, -apple-system, sans-serif' }}>
      {/* Navigation */}
      <nav style={{ position: 'fixed', top: '20px', left: 0, right: 0, zIndex: 100, padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.035em' }}>Gamit</div>
        <button onClick={() => openModal(false)} aria-label="Open login modal" style={{ background: '#ff488b', color: '#0d060b', border: 'none', padding: '10px 20px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>Login</button>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', backgroundColor: '#470c35', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '120px', paddingLeft: '20px', paddingRight: '20px', overflow: 'hidden' }}>
        <div style={{ fontSize: 'clamp(80px, 12vw, 160px)', fontWeight: 800, lineHeight: 0.84, textTransform: 'lowercase', maxWidth: '62%', marginBottom: '60px', letterSpacing: '-0.035em' }}>find your stuff</div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', color: '#0d060b', padding: '32px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '120px' }}>
          <p style={{ fontSize: '16px', fontWeight: 400, maxWidth: '40ch', margin: 0, lineHeight: 1.5 }}>AI-powered visual matching brings lost campus belongings home in hours.</p>
          <button onClick={() => openModal(true)} style={{ background: '#470c35', color: '#ffffff', border: 'none', padding: '16px 32px', fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>Start</button>
        </div>
      </section>

      {/* Gallery */}
      <section style={{ backgroundColor: '#0d060b', padding: '60px 20px', minHeight: '90vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {sampleItems.map(item => (
            <div key={item.id} style={{ backgroundColor: '#1b0e17', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ position: 'relative', paddingBottom: '125%', overflow: 'hidden', backgroundColor: '#470c35' }}>
                <img src={item.image} alt={item.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: item.type === 'LOST' ? '#ff488b' : '#1b0e17', color: item.type === 'LOST' ? '#0d060b' : '#ff488b', padding: '4px 10px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', border: item.type === 'FOUND' ? '1px solid #ff488b' : 'none' }}>{item.type}</div>
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 500, margin: 0, color: '#ffffff', marginBottom: '8px' }}>{item.title}</h3>
                <div style={{ fontSize: '13px', color: '#9a8f97', marginBottom: '12px' }}><div>{item.location}</div><div>{item.date}</div></div>
                <button style={{ width: '100%', background: '#ff488b', color: '#0d060b', border: 'none', padding: '10px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>View</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: '#1b0e17', padding: '100px 20px', minHeight: '90vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(40px, 4.4vw, 68px)', fontWeight: 800, lineHeight: 1.1, margin: 0, marginBottom: '32px', textTransform: 'lowercase', letterSpacing: '-0.035em' }}>how it works</h2>
            <p style={{ fontSize: '16px', color: '#9a8f97', lineHeight: 1.6, maxWidth: '30ch' }}>Post your item. AI matches it with similar items. Get notified when we find a match.</p>
          </div>
          <div style={{ backgroundColor: '#ffffff', color: '#0d060b', padding: '40px', borderRadius: '4px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '24px', textTransform: 'uppercase' }}>Process</div>
            <div style={{ fontSize: '13px', lineHeight: 1.8, fontFamily: 'monospace' }}>
              <div style={{ marginBottom: '16px' }}><div style={{ fontWeight: 600 }}>Post</div><div style={{ color: '#6b7280' }}>Upload photo</div></div>
              <div style={{ marginBottom: '16px' }}><div style={{ fontWeight: 600 }}>AI Matches</div><div style={{ color: '#6b7280' }}>5-30 minutes</div></div>
              <div><div style={{ fontWeight: 600 }}>Connected</div><div style={{ color: '#6b7280' }}>You get results</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <a href="#signup" onClick={(e) => { e.preventDefault(); openModal(true); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', backgroundColor: '#ff488b', color: '#0d060b', textDecoration: 'none', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0d060b'; e.currentTarget.style.color = '#ff488b'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ff488b'; e.currentTarget.style.color = '#0d060b'; }}>
        <div style={{ fontSize: 'clamp(80px, 20vw, 240px)', fontWeight: 800, lineHeight: 0.9, textTransform: 'lowercase', textAlign: 'center', letterSpacing: '-0.035em' }}>reclaim</div>
      </a>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1b0e17', color: '#9a8f97', padding: '80px 20px', minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', fontSize: '13px', lineHeight: 1.6 }}>
          <div>Campus lost and found on AI</div>
          <div style={{ textAlign: 'center' }}>3.2k items recovered</div>
          <div style={{ textAlign: 'right' }}>8.4k members</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', paddingTop: '40px', borderTop: '1px solid #470c35' }}><p>&copy; 2026 Ay, Gamit Ko To…</p></div>
      </footer>

      {/* Auth Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#1b0e17', borderRadius: '4px', maxWidth: '400px', width: '100%', padding: '32px', boxShadow: '0 20px 60px rgba(255, 72, 139, 0.2)', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9a8f97' }} aria-label="Close modal">X</button>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '-0.035em' }}>{isRegister ? 'Join' : 'Login'}</h2>
            <p style={{ fontSize: '14px', color: '#9a8f97', marginBottom: '24px' }}>{isRegister ? 'Connect with your campus' : 'Welcome back'}</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9a8f97', marginBottom: '8px', textTransform: 'uppercase' }}>Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required={isRegister} autoComplete="name" style={{ width: '100%', padding: '10px 12px', border: '1px solid #470c35', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#0d060b', color: '#ffffff' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9a8f97', marginBottom: '8px', textTransform: 'uppercase' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@campus.edu" required autoComplete="email" style={{ width: '100%', padding: '10px 12px', border: '1px solid #470c35', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#0d060b', color: '#ffffff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9a8f97', marginBottom: '8px', textTransform: 'uppercase' }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="--------" required autoComplete="current-password" spellCheck={false} style={{ width: '100%', padding: '10px 12px', border: '1px solid #470c35', borderRadius: '4px', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#0d060b', color: '#ffffff' }} />
              </div>
              {error && <div style={{ padding: '12px', backgroundColor: 'rgba(255, 72, 139, 0.1)', border: '1px solid #ff488b', borderRadius: '4px', color: '#ff488b', fontSize: '13px' }}>{error}</div>}
              <button type="submit" disabled={loading} style={{ background: '#ff488b', color: '#0d060b', border: 'none', padding: '12px 16px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit' }}>
                {loading ? (<><Loader className="w-4 h-4 animate-spin" aria-label="Loading" />{isRegister ? 'Creating...' : 'Logging in...'}</>) : (isRegister ? 'Create Account' : 'Login')}
              </button>
            </form>
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#9a8f97' }}>{isRegister ? 'Already member?' : 'New here?'}{' '}<button onClick={() => { setIsRegister(!isRegister); setError(''); }} aria-label={isRegister ? 'Switch to login' : 'Switch to register'} style={{ background: 'none', border: 'none', color: '#ff488b', fontWeight: 700, cursor: 'pointer', fontSize: '13px', textTransform: 'uppercase', fontFamily: 'inherit' }}>{isRegister ? 'Login' : 'Register'}</button></p>
            </div>
            <div style={{ marginTop: '24px', padding: '12px', backgroundColor: 'rgba(71, 12, 53, 0.3)', border: '1px solid #470c35', borderRadius: '4px' }}>
              <p style={{ fontSize: '11px', color: '#9a8f97', margin: 0 }}><strong style={{ color: '#ff488b' }}>Demo:</strong> testuser@example.com / testpassword123</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
