import React, { useState } from 'react';
import '../styles/redesign.css';
import { X, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function RedesignedLanding() {
  const [activeStage, setActiveStage] = useState(0);
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
      let result;
      if (isRegister) {
        result = await register(email, password, fullName);
      } else {
        result = await login(email, password);
      }

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

  const stages = [
    {
      name: 'Report',
      description: 'Post lost or found items with photos and location details. Our AI analyzes the image instantly.'
    },
    {
      name: 'Scan',
      description: 'The system scans for matches across the entire campus database using visual and spatial embeddings.'
    },
    {
      name: 'Verify',
      description: 'Answer a secret question to prove ownership. Staff reviews and approves claims within hours.'
    },
    {
      name: 'Claim',
      description: 'Pick up your item at the campus office with your ID. Items held for 60 days.'
    }
  ];

  return (
    <div className="redesigned-landing">
      {/* Hero: Waterline headline */}
      <section className="hero">
        <div className="hero-header">
          <div className="hero-wordmark">Ay, Gamit Ko 'To!</div>
          <button 
            className="hero-action"
            onClick={() => {
              setShowModal(true);
              setIsRegister(false);
              setError('');
            }}
            aria-label="Login to your account"
          >
            Login
          </button>
        </div>

        <div className="hero-content">
          <h1 className="hero-headline">
            <span className="hero-headline-line-1">Find Your</span>
            <span className="hero-headline-line-2">Stuff</span>
          </h1>
          <p className="hero-supporting">
            AI-powered visual matching brings lost campus belongings home in hours, not weeks.
          </p>
        </div>
      </section>

      {/* Chapter 1: Features */}
      <section className="chapter chapter-1">
        <div className="chapter-grid">
          <div className="chapter-col-3">
            <h2>Smart Matching</h2>
            <p>Post once. Our CLIP model finds matches across campus instantly using visual embeddings and location data.</p>
          </div>
          <div className="chapter-col-9">
            <div className="tiles">
              <div className="tile" style={{ backgroundColor: '#d1ddd3' }}>
                <img src="https://picsum.photos/id/669/600/750?grayscale" alt="Camera capturing item details" loading="lazy" width="600" height="750" />
              </div>
              <div className="tile" style={{ backgroundColor: '#f0ff1c' }}>
                <img src="https://picsum.photos/id/177/800/500?grayscale" alt="AI processing visual match" loading="lazy" width="800" height="500" />
              </div>
              <div className="tile" style={{ backgroundColor: '#000000' }}>
                <img src="https://picsum.photos/id/338/600/750?grayscale" alt="Map showing item location" loading="lazy" width="600" height="750" />
              </div>
              <div className="tile" style={{ backgroundColor: '#d1ddd3' }}>
                <img src="https://picsum.photos/id/685/800/500?grayscale" alt="Verification process" loading="lazy" width="800" height="500" />
              </div>
              <div className="tile" style={{ backgroundColor: '#f0ff1c' }}>
                <img src="https://picsum.photos/id/550/600/750?grayscale" alt="Successful item recovery" loading="lazy" width="600" height="750" />
              </div>
            </div>
            <div className="tile-label">Instant visual embeddings</div>
            <div className="tile-fact">92% match accuracy on first scan</div>
          </div>
        </div>
      </section>

      {/* Chapter 2: How It Works */}
      <section className="chapter chapter-2">
        <div className="chapter-grid">
          <div className="chapter-col-3">
            <h2>How It Works</h2>
            <p>Four simple steps from lost to found. The system runs in the background while staff handles verification.</p>
          </div>
        </div>

        <div className="accordion">
          {stages.map((stage, index) => (
            <div
              key={index}
              className={`accordion-stage ${activeStage === index ? 'active' : ''}`}
              onClick={() => setActiveStage(index)}
              role="tab"
              aria-selected={activeStage === index}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveStage(index);
                }
              }}
            >
              <span className="accordion-stage-name">{stage.name}</span>
              {activeStage === index && (
                <div className="accordion-content">
                  <h3>{stage.name}</h3>
                  <p>{stage.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Chapter 3: Stats */}
      <section className="chapter chapter-3">
        <h2>By The Numbers</h2>
        <div className="mosaic">
          <div className="mosaic-photo">
            <img 
              src="https://picsum.photos/id/665/1200/1200?grayscale" 
              alt="Campus recovery center" 
              loading="lazy"
              width="1200"
              height="1200"
            />
          </div>
          <div className="mosaic-tile" style={{ backgroundColor: '#fe7141', color: '#000000' }}>
            <div className="mosaic-figure">3.2K</div>
            <div className="mosaic-caption">Items recovered this year</div>
          </div>
          <div className="mosaic-tile" style={{ backgroundColor: '#000000', color: '#f4f4f4' }}>
            <div className="mosaic-figure">89%</div>
            <div className="mosaic-caption">Claimed within 24 hours</div>
          </div>
        </div>
      </section>

      {/* Chapter 4: CTA */}
      <section className="chapter chapter-4">
        <h2>Start Searching Today</h2>
        <div className="cta-footer">
          <p className="cta-sentence">
            Join 8,400 campus members already recovering lost items. Create an account in seconds.
          </p>
          <button 
            className="cta-button"
            onClick={() => {
              setShowModal(true);
              setIsRegister(true);
              setError('');
            }}
            aria-label="Create a new account"
          >
            Sign Up
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="wordmark-blocks">
          {'AYGA'.split('').map((letter, i) => (
            <div key={i} className="wordmark-block">{letter}</div>
          ))}
        </div>

        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 Ay, Gamit Ko 'To! All rights reserved.</span>
          <button 
            className="cta-button"
            onClick={() => {
              setShowModal(true);
              setIsRegister(false);
              setError('');
            }}
            style={{ width: 'auto' }}
            aria-label="Login to account"
          >
            Login
          </button>
        </div>
      </footer>

      {/* Auth Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            maxWidth: '400px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#9ca3af'
              }}
              aria-label="Close modal"
            >
              ✕
            </button>

            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#000000',
              marginBottom: '8px',
              fontFamily: 'Chivo, sans-serif',
              textTransform: 'uppercase'
            }}>
              {isRegister ? 'Create Account' : 'Login'}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '24px'
            }}>
              {isRegister ? 'Join the campus community' : 'Welcome back'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isRegister && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required={isRegister}
                    autoComplete="name"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  required
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  spellCheck={false}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '4px',
                  color: '#dc2626',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#ea580c' : '#fe7141',
                  color: '#000000',
                  border: 'none',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: 'Chivo, sans-serif'
                }}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" aria-label="Loading" />
                    {isRegister ? 'Creating...' : 'Logging in...'}
                  </>
                ) : (
                  isRegister ? 'Create Account' : 'Login'
                )}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fe7141',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {isRegister ? 'Login' : 'Register'}
                </button>
              </p>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '12px',
              backgroundColor: '#dbeafe',
              border: '1px solid #bfdbfe',
              borderRadius: '4px'
            }}>
              <p style={{ fontSize: '12px', color: '#1e40af', margin: 0 }}>
                <strong>Demo:</strong> testuser@example.com / testpassword123
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

