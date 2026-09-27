import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { 
  Activity, 
  Bell, 
  Globe, 
  LogOut, 
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isPatient } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data?.count || 0);
      } catch (err) {
        // graceful ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'ROLE_PATIENT': return t('role_patient');
      case 'ROLE_DOCTOR': return t('role_doctor');
      case 'ROLE_CHW': return t('role_chw');
      case 'ROLE_ADMIN': return t('role_admin');
      default: return 'User';
    }
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand & Project Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          borderRadius: '8px',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Activity size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
            {t('appName')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {t('appTagline')}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="btn btn-secondary btn-sm"
          title="Toggle English / Tamil"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Globe size={15} />
          <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
        </button>

        {/* Emergency quick link for Patients */}
        {isPatient && (
          <a
            href="/patient/emergency"
            className="btn btn-danger btn-sm"
            style={{ fontWeight: 600 }}
          >
            <ShieldAlert size={15} />
            <span>SOS</span>
          </a>
        )}

        {/* Notifications badge */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} title="Notifications">
          <Bell size={20} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-8px',
              backgroundColor: 'var(--danger)',
              color: 'white',
              fontSize: '0.68rem',
              fontWeight: 700,
              borderRadius: '9999px',
              padding: '1px 5px',
              minWidth: '16px',
              textAlign: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </div>

        {/* User profile & Role chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          paddingLeft: '0.75rem',
          borderLeft: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.fullName}
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
              {getRoleLabel()}
            </span>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.6rem' }}
            title={t('logout')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
