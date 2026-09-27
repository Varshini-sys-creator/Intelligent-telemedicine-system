import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <Activity size={50} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        404 — Page Not Found
      </h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
        The healthcare portal page you requested could not be located.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}
