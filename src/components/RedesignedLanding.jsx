import React, { useState } from 'react';
import '../styles/redesign.css';
import { X, Loader, Search, Plus } from 'lucide-react';
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

  const sampleItems = [
    {
      id: 1,
      type: 'LOST',
      title: 'Black iPhone 14 Pro',
      location: 'Library, 3rd Floor',
      date: 'Oct 28, 2026',
      image: 'https://picsum.photos/id/669/400/300?grayscale',
      matchScore: '92%'
    },
    {
      id: 2,
      type: 'FOUND',
      title: 'Sony WH-1000XM5 Headphones',
      location: 'Student Center Cafeteria',
      date: 'Oct 27, 2026',
      image: 'https://picsum.photos/id/177/400/300?grayscale',
      matchScore: null
    },
    {
      id: 3,
      type: 'LOST',
      title: 'Blue Fjallraven Kanken Backpack',
      location: 'CS Building Parking',
      date: 'Oct 26, 2026',
      image: 'https://picsum.photos/id/338/400/300?grayscale',
      matchScore: null
    },
    {
      id: 4,
      type: 'FOUND',
      title: 'Samsung Galaxy Watch 5',
      location: 'Gym Locker Room',
      date: 'Oct 25, 2026',
      image: 'https://picsum.photos/id/685/400/300?grayscale',
      matchScore: null
    },
    {
      id: 5,
      type: 'LOST',
      title: 'Gold Class Ring w/ Initials',
      location: 'Science Building',
      date: 'Oct 24, 2026',
      image: 'https://picsum.photos/id/550/400/300?grayscale',
      matchScore: '87%'
    },
    {
      id: 6,
      type: 'FOUND',
      title: 'AirPods Pro (White)',
      location: 'Dormitory Hallway',
      date: 'Oct 23, 2026',
      image: 'https://picsum.photos/id/665/400/300?grayscale',
      matchScore: null
    }
  ];

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* Hero */}
      <section style={{
        backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        padding: '80px 28px',
        textAlign: 'center',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: 'clamp(40px, 8vw, 56px)',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '-0.05em',
          marginBottom: '16px',
          fontFamily: 'Chivo, sans-serif',
          color: '#000000'
        }}>
          Ay, Gamit Ko 'To!
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#6b7280',
          marginBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto 32px'
        }}>
          Find your lost belongings on campus with AI-powered visual matching. Connect with your community in seconds.
        </p>
        <button
          onClick={() => {
            setShowModal(true);
            setIsRegister(false);
            setError('');
          }}
          style={{
            background: '#fe7141',
            color: '#000000',
            border: 'none',
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Chivo, sans-serif'
          }}
        >
          <Plus style={{ display: 'inline', width: '16px', height: '16px', marginRight: '8px' }} />
          Start Now
        </button>
      </section>

      {/* Search Bar */}
      <section style={{
        padding: '40px 28px',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px'
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            padding: '12px'
          }}>
            <Search style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
            <input
              type="search"
              placeholder="Search lost items..."
              style={{
                flex: 1,
                border: 'none',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
          </div>
          <button
            style={{
              background: '#fe7141',
              color: '#000000',
              border: 'none',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Chivo, sans-serif'
            }}
          >
            SEARCH
          </button>
        </div>
      </section>

      {/* Items Grid */}
      <section style={{
        padding: '60px 28px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '-0.05em',
          marginBottom: '40px',
          fontFamily: 'Chivo, sans-serif',
          color: '#000000'
        }}>
          Recent Posts
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {sampleItems.map(item => (
            <div key={item.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              transition: 'all 0.2s',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              ':hover': {
                borderColor: '#fe7141',
                boxShadow: '0 4px 12px rgba(254, 113, 65, 0.1)'
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#fe7141';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(254, 113, 65, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  display: 'block'
                }}
                loading="lazy"
              />

              {/* Content */}
              <div style={{ padding: '16px' }}>
                {/* Type Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                  marginBottom: '12px',
                  backgroundColor: item.type === 'LOST' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                  color: item.type === 'LOST' ? '#dc2626' : '#16a34a'
                }}>
                  {item.type}
                </div>

                {/* Match Score */}
                {item.matchScore && (
                  <div style={{
                    display: 'inline-block',
                    marginLeft: '8px',
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(254, 113, 65, 0.1)',
                    color: '#fe7141',
                    borderRadius: '2px'
                  }}>
                    {item.matchScore} MATCH
                  </div>
                )}

                {/* Title */}
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  color: '#000000',
                  fontFamily: 'Chivo, sans-serif'
                }}>
                  {item.title}
                </h3>

                {/* Meta */}
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginBottom: '12px',
                  lineHeight: '1.5'
                }}>
                  <div>📍 {item.location}</div>
                  <div>📅 {item.date}</div>
                </div>

                {/* Action Button */}
                <button
                  style={{
                    width: '100%',
                    background: '#fe7141',
                    color: '#000000',
                    border: 'none',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'Chivo, sans-serif'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{
        backgroundColor: '#f9fafb',
        padding: '60px 28px',
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 900,
              color: '#fe7141',
              fontFamily: 'Chivo, sans-serif'
            }}>
              3.2K
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '8px'
            }}>
              Items Recovered
            </div>
          </div>
          <div>
            <div style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 900,
              color: '#fe7141',
              fontFamily: 'Chivo, sans-serif'
            }}>
              89%
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '8px'
            }}>
              Returned Successfully
            </div>
          </div>
          <div>
            <div style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 900,
              color: '#fe7141',
              fontFamily: 'Chivo, sans-serif'
            }}>
              8.4K
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '8px'
            }}>
              Campus Members
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '60px 28px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 44px)',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '-0.05em',
          marginBottom: '24px',
          fontFamily: 'Chivo, sans-serif'
        }}>
          Lost Something?
        </h2>
        <p style={{
          fontSize: '16px',
          marginBottom: '32px',
          maxWidth: '500px',
          margin: '0 auto 32px',
          color: '#d1d5db'
        }}>
          Post it now and let our AI help you find it. Thousands of campus members are ready to help.
        </p>
        <button
          onClick={() => {
            setShowModal(true);
            setIsRegister(true);
            setError('');
          }}
          style={{
            background: '#fe7141',
            color: '#000000',
            border: 'none',
            padding: '14px 40px',
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Chivo, sans-serif'
          }}
        >
          Create Account
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        padding: '40px 28px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <p style={{ marginBottom: '16px' }}>
          <strong style={{ color: '#000000' }}>Ay, Gamit Ko 'To!</strong> • Campus Lost & Found Platform
        </p>
        <p>
          &copy; 2026 All rights reserved. • 
          <a href="#" style={{ color: '#fe7141', textDecoration: 'none', marginLeft: '8px' }}>Privacy</a> •
          <a href="#" style={{ color: '#fe7141', textDecoration: 'none', marginLeft: '8px' }}>Terms</a> •
          <a href="#" style={{ color: '#fe7141', textDecoration: 'none', marginLeft: '8px' }}>Contact</a>
        </p>
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
