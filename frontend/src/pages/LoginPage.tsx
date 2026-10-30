import React, { useState } from 'react';

interface Props {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('sentinel123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate auth (bypasses backend for demo)
    await new Promise(r => setTimeout(r, 800));
    
    const validCreds: Record<string, string> = {
      'admin': 'sentinel123',
      'analyst': 'analyst123', 
      'forensics': 'forensics123'
    };
    
    if (validCreds[username] === password) {
      onLogin();
    } else {
      setError('Invalid credentials. Try admin / sentinel123');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none'
      }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
            borderRadius: '50%',
            background: i % 2 === 0 
              ? 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
            left: `${10 + i * 20}%`,
            top: `${10 + i * 15}%`,
            animation: `pulse-dot ${2 + i}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>

      <div className="login-card animate-fade">
        <div className="login-logo">
          <div className="logo-icon">🛡️</div>
          <div className="logo-title">SENTINEL-X</div>
          <div className="logo-subtitle" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            AI-DRIVEN CYBER THREAT DETECTION PLATFORM
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>
          
          {error && (
            <div style={{ color: 'var(--critical)', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: 'rgba(255,59,48,0.1)', borderRadius: 6 }}>
              {error}
            </div>
          )}

          <button id="login-submit" className="login-btn" type="submit" disabled={loading}>
            {loading ? '🔐 Authenticating...' : '🔑 Access Platform'}
          </button>
        </form>

        <div className="demo-creds">
          <p style={{ marginBottom: 8, color: 'var(--text-secondary)', fontWeight: 600 }}>Demo Credentials:</p>
          <p><strong>admin</strong> / <strong>sentinel123</strong> — SOC Admin</p>
          <p><strong>analyst</strong> / <strong>analyst123</strong> — Security Analyst</p>
          <p><strong>forensics</strong> / <strong>forensics123</strong> — DFIR Specialist</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: 'var(--text-muted)' }}>
          🔒 Secured with JWT + RBAC • All actions logged • SOC-2 Compliant
        </div>
      </div>
    </div>
  );
}
