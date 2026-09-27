import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FileText, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AddMedicalRecord() {
  const location = useLocation();
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState(location.state?.patientId || 1);
  const [consultationId, setConsultationId] = useState(location.state?.consultationId || '');
  const [patientName, setPatientName] = useState(location.state?.patientName || 'Patient Ramanathan K');
  
  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpRecommendation, setFollowUpRecommendation] = useState('');
  
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: 'Paracetamol 500mg', dosage: '500mg', frequency: '1-0-1 after food', durationDays: 5, specialInstructions: 'Take with warm water' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      { medicineName: '', dosage: '', frequency: '1-0-1 after food', durationDays: 3, specialInstructions: '' }
    ]);
  };

  const removePrescriptionRow = (index) => {
    setPrescriptions(prescriptions.filter((_, idx) => idx !== index));
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosisSummary.trim()) {
      setError('Please provide a diagnosis summary.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await api.post('/medical-records', {
        patientId: parseInt(patientId, 10),
        consultationId: consultationId ? parseInt(consultationId, 10) : null,
        diagnosisSummary,
        clinicalNotes,
        followUpRecommendation,
        prescriptions: prescriptions.filter((p) => p.medicineName.trim() !== '')
      });

      // If tied to consultation, mark it completed
      if (consultationId) {
        try {
          await api.put(`/consultations/${consultationId}/status`, { status: 'COMPLETED' });
        } catch (statusErr) {
          console.warn('Consultation status auto-complete notice:', statusErr);
        }
      }

      navigate('/doctor');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate medical record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FileText size={26} color="var(--primary)" />
          Clinical Consultation Summary & Prescription
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Record clinical findings and issue digital prescriptions for rural and tribal patients.
        </p>
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Patient & Case Context</span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Patient Name</label>
              <input
                type="text"
                className="form-input"
                disabled
                value={patientName}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Associated Consultation ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="Optional (auto-filled if launched from consultation)"
                value={consultationId}
                onChange={(e) => setConsultationId(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Diagnosis Summary *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Mild Upper Respiratory Viral Infection"
              value={diagnosisSummary}
              onChange={(e) => setDiagnosisSummary(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Doctor Clinical Notes & Observations</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Document physical observations, vital readings evaluated, patient history..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Digital Prescription Builder */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Digital Medication Prescription</span>
            <button
              type="button"
              onClick={addPrescriptionRow}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={15} />
              <span>Add Medicine</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {prescriptions.map((p, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1.5fr 1fr 2fr auto',
                  gap: '0.5rem',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Medicine Name (e.g. Paracetamol)"
                    value={p.medicineName}
                    onChange={(e) => handlePrescriptionChange(idx, 'medicineName', e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Dosage (500mg)"
                    value={p.dosage}
                    onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Frequency (1-0-1)"
                    value={p.frequency}
                    onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="Days (5)"
                    value={p.durationDays}
                    onChange={(e) => handlePrescriptionChange(idx, 'durationDays', e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Instructions (after food)"
                    value={p.specialInstructions}
                    onChange={(e) => handlePrescriptionChange(idx, 'specialInstructions', e.target.value)}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removePrescriptionRow(idx)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)', padding: '0.4rem' }}
                    title="Remove medicine"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Follow-Up & Dietary Recommendation</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Plenty of oral fluids; return if high fever persists beyond 3 days"
              value={followUpRecommendation}
              onChange={(e) => setFollowUpRecommendation(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/doctor')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            <CheckCircle size={16} />
            <span>{submitting ? 'Submitting...' : 'Sign & Issue Medical Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
