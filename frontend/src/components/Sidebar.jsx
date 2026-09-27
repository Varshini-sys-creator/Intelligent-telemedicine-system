import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Stethoscope,
  Calendar,
  FileText,
  HeartPulse,
  AlertTriangle,
  Brain,
  Users,
  BarChart3,
  Video
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const getNavLinks = () => {
    switch (user?.role) {
      case 'ROLE_PATIENT':
        return [
          { to: '/patient', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/patient/symptoms', label: t('symptomChecker'), icon: Brain },
          { to: '/patient/book', label: t('bookConsultation'), icon: Stethoscope },
          { to: '/patient/consultations', label: t('myConsultations'), icon: Calendar },
          { to: '/patient/records', label: t('medicalRecords'), icon: FileText },
          { to: '/patient/monitoring', label: t('healthMonitoring'), icon: HeartPulse },
          { to: '/patient/emergency', label: t('emergencySos'), icon: AlertTriangle, danger: true },
        ];
      case 'ROLE_DOCTOR':
        return [
          { to: '/doctor', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/doctor/requests', label: t('consultationRequests'), icon: Calendar },
          { to: '/doctor/records/new', label: t('createPrescription'), icon: FileText },
          { to: '/doctor/analytics', label: t('outbreakAnalytics'), icon: BarChart3 },
        ];
      case 'ROLE_CHW':
        return [
          { to: '/chw', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/chw/patients', label: t('patientDirectory'), icon: Users },
          { to: '/chw/monitoring', label: t('healthMonitoring'), icon: HeartPulse },
          { to: '/chw/analytics', label: t('outbreakAnalytics'), icon: BarChart3 },
          { to: '/chw/emergency', label: t('activeSosAlerts'), icon: AlertTriangle, danger: true },
        ];
      case 'ROLE_ADMIN':
        return [
          { to: '/admin', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/admin/analytics', label: t('outbreakAnalytics'), icon: BarChart3 },
          { to: '/admin/users', label: t('userManagement'), icon: Users },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem 0.75rem'
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/patient' || item.to === '/doctor' || item.to === '/chw' || item.to === '/admin'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: item.danger
                  ? 'var(--danger)'
                  : isActive
                  ? 'var(--primary)'
                  : 'var(--text-main)',
                backgroundColor: isActive
                  ? 'var(--primary-light)'
                  : item.danger
                  ? 'var(--danger-light)'
                  : 'transparent',
                textDecoration: 'none',
                transition: 'background-color 0.15s ease'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* College Project Disclaimer note in sidebar */}
      <div style={{
        marginTop: 'auto',
        padding: '0.85rem',
        backgroundColor: '#f8fafc',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
        fontSize: '0.72rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          {t('finalYearProject')}
        </div>
        {t('projectSubtitle')}
      </div>
    </aside>
  );
}
