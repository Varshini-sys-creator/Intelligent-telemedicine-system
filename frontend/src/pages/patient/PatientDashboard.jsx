import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  Calendar,
  HeartPulse,
  Brain,
  Stethoscope,
  FileText,
  AlertTriangle,
  ArrowRight,
  Clock,
  Video
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [latestVital, setLatestVital] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [profRes, consRes, vitRes, recRes] = await Promise.allSettled([
          api.get('/patients/profile'),
          api.get('/consultations'),
          api.get('/monitoring/my/latest'),
          api.get('/medical-records/my'),
        ]);

        if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
        if (consRes.status === 'fulfilled') setConsultations(consRes.value.data);
        if (vitRes.status === 'fulfilled' && vitRes.value.data) setLatestVital(vitRes.value.data);
        if (recRes.status === 'fulfilled') setRecentRecords(recRes.value.data);
      } catch (err) {
        console.error('Error loading patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const upcoming = consultations.find(
    (c) => c.status === 'ACCEPTED' || c.status === 'REQUESTED' || c.status === 'ONGOING'
  );

  return (
    <div>
      {/* Welcome Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {t('welcome')}, {user?.fullName}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {profile?.villageCommunity ? `${profile.villageCommunity}, ` : ''}
            {profile?.district || 'Tamil Nadu'} • Blood Group: {profile?.bloodGroup || 'O+'}
          </p>
        </div>

        <Link to="/patient/emergency" className="btn btn-danger">
          <AlertTriangle size={18} />
          <span>{t('emergencySos')}</span>
        </Link>
      </div>

      {/* Emergency Notice Banner */}
      <div className="alert-box alert-warning">
        <AlertTriangle size={20} style={{ flexShrink: 0 }} />
        <div>
          <strong>Medical Notice: </strong>
          {t('emergencyAlert')}
        </div>
      </div>

      {/* Grid: Upcoming Consultation & Recent Vitals */}
      <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
        {/* Upcoming Consultation */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <span className="card-title">
              <Calendar size={20} color="var(--primary)" />
              {t('nextConsultation')}
            </span>
            {upcoming && (
              <span className={`badge ${upcoming.status === 'ACCEPTED' ? 'badge-success' : 'badge-warning'}`}>
                {upcoming.status}
              </span>
            )}
          </div>

          {upcoming ? (
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {upcoming.doctor?.user?.fullName || 'Assigned Medical Specialist'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {upcoming.doctor?.specialization} • {upcoming.doctor?.hospitalAffiliation || 'District Hospital'}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <Clock size={16} />
                <span>
                  {upcoming.scheduledTime 
                    ? new Date(upcoming.scheduledTime).toLocaleString()
                    : 'Time pending doctor confirmation'}
                </span>
              </div>

              {upcoming.status === 'ACCEPTED' || upcoming.status === 'ONGOING' ? (
                <Link
                  to={`/consultation/room/${upcoming.meetingLink || 'room-' + upcoming.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Video size={16} />
                  <span>{t('joinCall')}</span>
                </Link>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Request submitted. Waiting for doctor acceptance.
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p>{t('noUpcomingConsultations')}</p>
              <Link to="/patient/book" className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
                <Stethoscope size={15} />
                <span>Book a Consultation</span>
              </Link>
            </div>
          )}
        </div>

        {/* Latest Vitals Summary */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <span className="card-title">
              <HeartPulse size={20} color="var(--secondary)" />
              {t('recentVitals')}
            </span>
            <Link to="/patient/monitoring" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              View History →
            </Link>
          </div>

          {latestVital ? (
            <div>
              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('heartRate')}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {latestVital.heartRate || '--'} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>bpm</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal: 60-100</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('spo2')}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {latestVital.spo2 || '--'} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>%</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal: ≥ 95%</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('bloodPressure')}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {latestVital.bloodPressureSys || '--'}/{latestVital.bloodPressureDia || '--'}{' '}
                    <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>mmHg</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal: 120/80</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('temperature')}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {latestVital.temperature || '--'} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>°C</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal: 36.5-37.5</div>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                Recorded by: {latestVital.recordedBy || 'Self'} • {new Date(latestVital.recordedAt || Date.now()).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p>No health readings logged yet.</p>
              <Link to="/patient/monitoring" className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
                <HeartPulse size={15} />
                <span>Log Today's Vitals</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Services Navigation */}
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.85rem' }}>
        {t('quickActions')}
      </h2>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <Link to="/patient/symptoms" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.15s' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.6rem', borderRadius: '8px', color: 'var(--primary)' }}>
              <Brain size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {t('symptomChecker')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                AI-assisted preliminary symptom analysis with voice input support.
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/book" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--secondary-light)', padding: '0.6rem', borderRadius: '8px', color: 'var(--secondary)' }}>
              <Stethoscope size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {t('bookConsultation')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Connect remotely with qualified doctors and specialists.
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/records" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#f1f5f9', padding: '0.6rem', borderRadius: '8px', color: 'var(--text-muted)' }}>
              <FileText size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {t('medicalRecords')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Access verified clinical notes and digital doctor prescriptions.
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Medical Records / Prescriptions */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <FileText size={20} color="var(--primary)" />
            Recent Medical History & Prescriptions
          </span>
          <Link to="/patient/records" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            All Records →
          </Link>
        </div>

        {recentRecords.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Doctor</th>
                <th>Diagnosis Summary</th>
                <th>Prescriptions</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.slice(0, 3).map((rec) => (
                <tr key={rec.id}>
                  <td>{new Date(rec.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{rec.doctor?.user?.fullName}</td>
                  <td>{rec.diagnosisSummary || 'General consultation notes'}</td>
                  <td>
                    {rec.prescriptions && rec.prescriptions.length > 0
                      ? rec.prescriptions.map((p) => p.medicineName).join(', ')
                      : 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No previous consultation records on file.
          </div>
        )}
      </div>
    </div>
  );
}
