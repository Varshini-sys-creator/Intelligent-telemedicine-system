import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldCheck,
  Users,
  BarChart3,
  AlertTriangle,
  Activity,
  Trash2,
  Calendar,
  HeartPulse,
  Info
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [outbreakData, setOutbreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'analytics', 'users'

  const loadData = async () => {
    try {
      const [statsRes, usersRes, analyticsRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/analytics/outbreak-summary')
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      if (analyticsRes.status === 'fulfilled') setOutbreakData(analyticsRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      loadData();
    } catch (err) {
      alert('Could not delete user.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
          System Administration & Outbreak Analytics
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Platform oversight, user administration, and regional epidemiological trend observation.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={15} />
          <span>Platform Overview</span>
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={15} />
          <span>Disease & Outbreak Trends</span>
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={15} />
          <span>User Accounts</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>REGISTERED USERS</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.25rem 0' }}>
                {stats?.totalUsers ?? '--'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All roles combined</div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRIBAL / RURAL PATIENTS</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', margin: '0.25rem 0' }}>
                {stats?.totalPatients ?? '--'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enrolled in care</div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LICENSED DOCTORS</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--secondary)', margin: '0.25rem 0' }}>
                {stats?.totalDoctors ?? '--'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>On telemedicine roster</div>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL CONSULTATIONS</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)', margin: '0.25rem 0' }}>
                {stats?.totalConsultations ?? '--'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed or active</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <ShieldCheck size={18} color="var(--primary)" />
                Privacy & Data Governance Compliance
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              This platform adheres to college project medical privacy standards:
              Passwords use BCrypt salting and hashing. API endpoints are safeguarded via JWT authorization filters.
              Patient clinical records are restricted strictly to the consulting doctor and the respective patient.
              Administrators possess no direct backdoor access to private consultation notes.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Disease Outbreak Analytics */}
      {activeTab === 'analytics' && (
        <div>
          {/* Honest College Project Analytics Disclaimer */}
          <div className="alert-box alert-warning">
            <Info size={18} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem' }}>
              <strong>Demonstration Analytics: </strong>
              {outbreakData?.disclaimer || 'Data aggregated from patient symptom assessments and vitals for demonstration purposes. Not an epidemiological model.'}
            </div>
          </div>

          {/* Early Warning Flags */}
          {outbreakData?.earlyWarningAlerts && outbreakData.earlyWarningAlerts.length > 0 && (
            <div className="card" style={{ borderColor: 'var(--warning)', backgroundColor: '#fffbeb' }}>
              <div className="card-header" style={{ borderBottomColor: '#fef3c7' }}>
                <span className="card-title" style={{ color: '#b45309' }}>
                  <AlertTriangle size={18} />
                  Cluster Early Warning Signals
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {outbreakData.earlyWarningAlerts.map((alert, idx) => (
                  <div key={idx} style={{ fontSize: '0.875rem', color: '#92400e' }}>
                    <strong>{alert.region}: </strong> {alert.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid-2">
            {/* Symptom Frequency Bar Chart (CSS-based) */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Reported Symptom Frequency</span>
              </div>

              {outbreakData?.symptomTrends ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                  {Object.entries(outbreakData.symptomTrends).map(([cat, count]) => {
                    const pct = Math.min(100, Math.max(10, count * 30));
                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 500 }}>{cat}</span>
                          <span style={{ fontWeight: 600 }}>{count} cases</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: cat.includes('Fever') ? 'var(--warning)' : 'var(--primary)',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No symptom data collected.</div>
              )}
            </div>

            {/* Regional Case Distribution */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Enrolled Patient Regional Distribution</span>
              </div>

              {outbreakData?.regionDistribution ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>District / Cluster</th>
                      <th>Registered Patients</th>
                      <th>Risk Indicator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(outbreakData.regionDistribution).map(([reg, cnt]) => (
                      <tr key={reg}>
                        <td style={{ fontWeight: 600 }}>{reg}</td>
                        <td>{cnt}</td>
                        <td>
                          <span className="badge badge-success">Monitored</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No regional data.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Platform User Accounts ({users.length})</span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Language</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge badge-info">{u.role}</span>
                  </td>
                  <td>{u.languagePreference?.toUpperCase() || 'EN'}</td>
                  <td>
                    {u.role !== 'ROLE_ADMIN' && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
