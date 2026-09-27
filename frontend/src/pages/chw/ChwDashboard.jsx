import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  Users,
  HeartPulse,
  AlertTriangle,
  MapPin,
  CheckCircle,
  Plus,
  Stethoscope,
  Activity
} from 'lucide-react';

export default function ChwDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activeSOS, setActiveSOS] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vitals entry modal state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitalsModal, setVitalsModal] = useState(false);
  const [heartRate, setHeartRate] = useState(76);
  const [spo2, setSpo2] = useState(97);
  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  const [temperature, setTemperature] = useState(37.0);
  const [vitalsSubmitting, setVitalsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  const loadData = async () => {
    try {
      const [profRes, patRes, sosRes] = await Promise.allSettled([
        api.get('/chw/profile'),
        api.get('/chw/patients'),
        api.get('/emergency/active'),
      ]);
      if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
      if (patRes.status === 'fulfilled') setPatients(patRes.value.data);
      if (sosRes.status === 'fulfilled') setActiveSOS(sosRes.value.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveEmergency = async (id) => {
    try {
      await api.put(`/emergency/${id}/resolve`);
      setStatusNotice('Emergency marked as resolved and logged.');
      loadData();
    } catch (err) {
      alert('Could not resolve emergency.');
    }
  };

  const handleOpenVitals = (patient) => {
    setSelectedPatient(patient);
    setVitalsModal(true);
  };

  const submitFieldVitals = async (e) => {
    e.preventDefault();
    setVitalsSubmitting(true);
    try {
      await api.post('/monitoring', {
        patient: { id: selectedPatient.id },
        heartRate: parseInt(heartRate, 10),
        spo2: parseInt(spo2, 10),
        bloodPressureSys: parseInt(bpSys, 10),
        bloodPressureDia: parseInt(bpDia, 10),
        temperature: parseFloat(temperature),
      });
      setStatusNotice(`Field vitals recorded for ${selectedPatient.user?.fullName}`);
      setVitalsModal(false);
    } catch (err) {
      alert('Failed to save field vitals.');
    } finally {
      setVitalsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Community Health Worker Dashboard
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Assigned Cluster: <strong>{profile?.assignedRegion || 'Valparai Tribal Cluster'}</strong> ({profile?.assignedDistrict || 'Coimbatore'}) • Sub-Center: {profile?.centerName || 'Valparai Sub-Center'}
        </p>
      </div>

      {statusNotice && (
        <div className="alert-box alert-success">
          <CheckCircle size={18} />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Active Emergencies in District */}
      {activeSOS.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: '#fff5f5' }}>
          <div className="card-header" style={{ borderBottomColor: '#fecaca' }}>
            <span className="card-title" style={{ color: 'var(--danger)' }}>
              <AlertTriangle size={20} />
              Active Tribal Emergency SOS Alerts ({activeSOS.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeSOS.map((sos) => (
              <div
                key={sos.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #fecaca',
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
                  <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '1rem' }}>
                    🚨 {sos.emergencyType}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    Patient: <strong>{sos.patient?.user?.fullName}</strong> ({sos.patient?.user?.phone || 'Contact via cluster'})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Location: {sos.locationAddress} (GPS: {sos.latitude}, {sos.longitude})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Triggered: {new Date(sos.triggeredAt).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleResolveEmergency(sos.id)}
                  className="btn btn-success btn-sm"
                >
                  <CheckCircle size={15} />
                  <span>Mark Responded & Resolved</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMMUNITY PATIENTS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', margin: '0.25rem 0' }}>
            {patients.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Under assigned cluster supervision</div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>FIELD VISITS PENDING</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--secondary)', margin: '0.25rem 0' }}>
            {patients.length > 0 ? 2 : 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Routine maternal & chronic care checks</div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE SOS ALERTS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: activeSOS.length > 0 ? 'var(--danger)' : 'var(--success)', margin: '0.25rem 0' }}>
            {activeSOS.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requiring immediate cluster response</div>
        </div>
      </div>

      {/* Patients Directory in CHW District */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <Users size={18} color="var(--primary)" />
            Cluster Patients & Field Actions ({patients.length})
          </span>
        </div>

        {patients.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Age / Gender</th>
                <th>Settlement</th>
                <th>Emergency Contact</th>
                <th>Known Medical History</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.user?.fullName}</td>
                  <td>{p.age || 'N/A'} yrs / {p.gender || 'N/A'}</td>
                  <td>{p.villageCommunity || p.district}</td>
                  <td>{p.emergencyContact || p.user?.phone || 'None'}</td>
                  <td style={{ maxWidth: '240px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {p.medicalHistorySummary || 'No chronic history recorded'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenVitals(p)}
                      className="btn btn-secondary btn-sm"
                    >
                      <HeartPulse size={14} />
                      <span>Record Vitals</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No patients registered under this cluster yet.
          </div>
        )}
      </div>

      {/* Field Vitals Entry Modal */}
      {vitalsModal && selectedPatient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HeartPulse size={20} color="var(--secondary)" />
              Record Field Vitals for {selectedPatient.user?.fullName}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Recorded by CHW during household visit in {selectedPatient.villageCommunity || selectedPatient.district}.
            </p>

            <form onSubmit={submitFieldVitals}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Oxygen SpO2 (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Blood Pressure Sys (mmHg)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bpSys}
                    onChange={(e) => setBpSys(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Pressure Dia (mmHg)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={bpDia}
                    onChange={(e) => setBpDia(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setVitalsModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={vitalsSubmitting}
                >
                  {vitalsSubmitting ? 'Saving...' : 'Save Field Vitals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
