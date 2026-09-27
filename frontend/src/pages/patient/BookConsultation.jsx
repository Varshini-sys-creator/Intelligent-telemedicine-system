import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { Stethoscope, Calendar, Clock, Check, AlertCircle } from 'lucide-react';

export default function BookConsultation() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [symptomSummary, setSymptomSummary] = useState(
    location.state?.prefilledSymptoms || ''
  );
  const [scheduledTime, setScheduledTime] = useState('');
  const [consultationType, setConsultationType] = useState('VIDEO');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const url = specializationFilter
          ? `/doctors?specialization=${encodeURIComponent(specializationFilter)}`
          : '/doctors';
        const res = await api.get(url);
        setDoctors(res.data);
        if (res.data.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(res.data[0].id);
        }
      } catch (err) {
        setError('Could not load doctors list.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [specializationFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setError('Please select a doctor.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await api.post('/consultations', {
        doctorId: parseInt(selectedDoctorId, 10),
        symptomSummary,
        consultationType,
        scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : null
      });

      navigate('/patient/consultations', { state: { booked: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Stethoscope size={26} color="var(--secondary)" />
          {t('bookConsultation')}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Request a secure remote video consultation with a qualified doctor.
        </p>
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Booking Form */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Calendar size={18} />
              Consultation Details
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Specialist / Doctor</label>
              <select
                className="form-select"
                required
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.user?.fullName} — {doc.specialization} ({doc.hospitalAffiliation || 'Govt Hospital'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Mode</label>
              <select
                className="form-select"
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
              >
                <option value="VIDEO">Secure WebRTC Video Call</option>
                <option value="AUDIO">Audio Voice Call</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Date & Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Leave blank for next earliest available slot.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Brief Reason for Visit / Symptoms</label>
              <textarea
                className="form-textarea"
                rows="3"
                required
                placeholder="Describe your current symptoms or reason for consulting the doctor..."
                value={symptomSummary}
                onChange={(e) => setSymptomSummary(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={submitting || doctors.length === 0}
            >
              <Check size={16} />
              <span>{submitting ? 'Submitting Request...' : 'Confirm Consultation Request'}</span>
            </button>
          </form>
        </div>

        {/* Doctor Profiles directory */}
        <div>
          <div className="card-header" style={{ borderBottom: 'none', marginBottom: '0.5rem' }}>
            <span className="card-title">Available Doctors on Roster</span>
            <input
              type="text"
              className="form-input"
              style={{ width: '180px', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              placeholder="Filter by specialty..."
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="card"
                style={{
                  marginBottom: 0,
                  cursor: 'pointer',
                  borderColor: selectedDoctorId === String(doc.id) ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: selectedDoctorId === String(doc.id) ? 'var(--primary-light)' : 'white'
                }}
                onClick={() => setSelectedDoctorId(String(doc.id))}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      {doc.user?.fullName}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 500 }}>
                      {doc.specialization} • {doc.qualification}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {doc.hospitalAffiliation || 'District Headquarters Hospital'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Reg License: {doc.licenseNumber}
                    </div>
                  </div>
                  <span className="badge badge-success">Available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
