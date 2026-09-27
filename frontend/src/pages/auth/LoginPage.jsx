import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      // Navigate to role landing
      if (res.user.role === 'ROLE_PATIENT') navigate('/patient');
      else if (res.user.role === 'ROLE_DOCTOR') navigate('/doctor');
      else if (res.user.role === 'ROLE_CHW') navigate('/chw');
      else if (res.user.role === 'ROLE_ADMIN') navigate('/admin');
      else navigate('/');
    } else {
      setError(res.message);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        Sign In to Portal
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Access your healthcare records, consultations, and services.
      </p>

      {error && (
        <div className="alert-box alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            required
            placeholder="e.g. patient@telemed.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
          disabled={loading}
        >
          <LogIn size={16} />
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
        </button>
      </form>

      {/* College Project Viva / Demo Accounts Helper */}
      <div style={{
        marginTop: '1.75rem',
        paddingTop: '1.25rem',
        borderTop: '1px dashed var(--border-color)'
      }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          marginBottom: '0.6rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Demo Accounts (Click to autofill):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fillDemo('patient@telemed.org')}
          >
            👤 Patient (Ramanathan)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fillDemo('doctor@telemed.org')}
          >
            🩺 Doctor (Dr. Arun)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fillDemo('chw@telemed.org')}
          >
            🌿 CHW (Selvi M)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fillDemo('admin@telemed.org')}
          >
            ⚙️ Admin Officer
          </button>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>
          Demo Password for all: <code>password123</code>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ fontWeight: 600 }}>
          Register here
        </Link>
      </div>
    </div>
  );
}
