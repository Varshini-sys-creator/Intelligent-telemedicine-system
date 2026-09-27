import React from 'react';
import { Outlet } from 'react-router-dom';
import { Activity, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AuthLayout() {
  const { lang, toggleLanguage, t } = useLanguage();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      {/* Top language toggle */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '2rem' }}>
        <button
          onClick={toggleLanguage}
          className="btn btn-secondary btn-sm"
        >
          <Globe size={15} />
          <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
        </button>
      </div>

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: 'var(--primary)',
          color: 'white',
          marginBottom: '0.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Activity size={30} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {t('appName')}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {t('appTagline')}
        </p>
      </div>

      {/* Auth Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-md)',
        padding: '2rem'
      }}>
        <Outlet />
      </div>

      {/* Footer disclaimer */}
      <div style={{
        marginTop: '1.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        maxWidth: '420px'
      }}>
        College Mini Project — Computer Science & Engineering. Designed for accessible remote care in rural and tribal communities.
      </div>
    </div>
  );
}
