import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [profRes, consRes] = await Promise.allSettled([
        api.get('/doctors/profile'),
        api.get('/consultations')
      ]);
      if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
      if (consRes.status === 'fulfilled') setConsultations(consRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (consultationId, newStatus) => {
    try {
      await api.put(`/consultations/${consultationId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Could not update status.');
    }
  };

  const pendingRequests = consultations.filter((c) => c.status === 'REQUESTED');
  const activeConsultations = consultations.filter((c) => c.status === 'ACCEPTED' || c.status === 'ONGOING');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Doctor Portal — {user?.fullName}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {profile?.specialization} • {profile?.qualification} • {profile?.hospitalAffiliation || 'District Medical Center'}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PENDING REQUESTS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)', margin: '0.25rem 0' }}>
            {pendingRequests.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting your review and approval</div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SCHEDULED APPOINTMENTS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', margin: '0.25rem 0' }}>
            {activeConsultations.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready for video consultation</div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL CONSULTATIONS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)', margin: '0.25rem 0' }}>
            {consultations.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conducted through this portal</div>
        </div>
      </div>

      {/* Pending Requests Queue */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Calendar size={18} color="var(--warning)" />
            New Consultation Requests ({pendingRequests.length})
          </span>
        </div>

        {pendingRequests.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingRequests.map((c) => (
              <div
                key={c.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {c.patient?.user?.fullName} ({c.patient?.age || 'Age N/A'}, {c.patient?.gender || 'N/A'})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Village: {c.patient?.villageCommunity || 'Remote Tribal Area'}, {c.patient?.district} • Blood Group: {c.patient?.bloodGroup || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.35rem', color: 'var(--text-main)' }}>
                    <strong>Symptoms: </strong> {c.symptomSummary}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleStatusChange(c.id, 'ACCEPTED')}
                    className="btn btn-success btn-sm"
                  >
                    <CheckCircle size={15} />
                    <span>Accept Request</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(c.id, 'REJECTED')}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)' }}
                  >
                    <XCircle size={15} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No pending patient consultation requests at this moment.
          </div>
        )}
      </div>

      {/* Active Consultations Schedule */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Video size={18} color="var(--primary)" />
            Active / Accepted Consultations ({activeConsultations.length})
          </span>
          <Link to="/doctor/records/new" className="btn btn-secondary btn-sm">
            <FileText size={15} />
            <span>Create Prescription</span>
          </Link>
        </div>

        {activeConsultations.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Community</th>
                <th>Status</th>
                <th>Symptoms</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeConsultations.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.patient?.user?.fullName}</td>
                  <td>{c.patient?.villageCommunity || c.patient?.district}</td>
                  <td>
                    <span className="badge badge-success">{c.status}</span>
                  </td>
                  <td style={{ maxWidth: '250px', fontSize: '0.825rem' }}>{c.symptomSummary}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link
                        to={`/consultation/room/${c.meetingLink || 'room-' + c.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        <Video size={14} />
                        <span>Launch Video</span>
                      </Link>
                      <Link
                        to="/doctor/records/new"
                        state={{ patientId: c.patient?.id, consultationId: c.id, patientName: c.patient?.user?.fullName }}
                        className="btn btn-secondary btn-sm"
                        title="Add prescription"
                      >
                        <FileText size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No ongoing or accepted consultations today.
          </div>
        )}
      </div>
    </div>
  );
}
