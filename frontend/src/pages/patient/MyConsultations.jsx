import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { Calendar, Video, Clock, XCircle, CheckCircle, FileText, AlertCircle } from 'lucide-react';

export default function MyConsultations() {
  const { t } = useLanguage();
  const location = useLocation();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState(
    location.state?.booked ? 'Consultation request submitted successfully!' : ''
  );

  const fetchConsultations = async () => {
    try {
      const res = await api.get('/consultations');
      setConsultations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this consultation?')) return;
    try {
      await api.put(`/consultations/${id}/status`, { status: 'CANCELLED' });
      fetchConsultations();
    } catch (err) {
      alert('Could not cancel consultation.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
      case 'ONGOING':
        return <span className="badge badge-success">{status}</span>;
      case 'REQUESTED':
        return <span className="badge badge-warning">{status}</span>;
      case 'COMPLETED':
        return <span className="badge badge-info">{status}</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="badge badge-danger">{status}</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={26} color="var(--primary)" />
            {t('myConsultations')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Track appointment requests, join ongoing video consultations, and view records.
          </p>
        </div>
        <Link to="/patient/book" className="btn btn-primary btn-sm">
          + Book New Consultation
        </Link>
      </div>

      {successMsg && (
        <div className="alert-box alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          {t('loading')}
        </div>
      ) : consultations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {consultations.map((c) => (
            <div key={c.id} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      {c.doctor?.user?.fullName}
                    </span>
                    {getStatusBadge(c.status)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {c.doctor?.specialization} • {c.doctor?.hospitalAffiliation || 'District Hospital'}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                    <Clock size={14} />
                    <span>
                      Scheduled: {c.scheduledTime ? new Date(c.scheduledTime).toLocaleString() : 'Awaiting confirmation'}
                    </span>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    <strong>Reported Symptoms: </strong> {c.symptomSummary || 'None specified'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {(c.status === 'ACCEPTED' || c.status === 'ONGOING') && (
                    <Link
                      to={`/consultation/room/${c.meetingLink || 'room-' + c.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      <Video size={15} />
                      <span>{t('joinCall')}</span>
                    </Link>
                  )}

                  {c.status === 'COMPLETED' && (
                    <Link to="/patient/records" className="btn btn-secondary btn-sm">
                      <FileText size={15} />
                      <span>View Prescription</span>
                    </Link>
                  )}

                  {(c.status === 'REQUESTED' || c.status === 'ACCEPTED') && (
                    <button
                      onClick={() => handleCancel(c.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                    >
                      <XCircle size={15} />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>
            No consultations found
          </div>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            You have not booked any consultations yet.
          </p>
          <Link to="/patient/book" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
            Book Consultation
          </Link>
        </div>
      )}
    </div>
  );
}
