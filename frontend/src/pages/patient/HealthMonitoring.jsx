import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { HeartPulse, Plus, AlertTriangle, CheckCircle, Info, Activity } from 'lucide-react';

export default function HealthMonitoring() {
  const { t } = useLanguage();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // New reading form state
  const [heartRate, setHeartRate] = useState(72);
  const [spo2, setSpo2] = useState(98);
  const [bloodPressureSys, setBloodPressureSys] = useState(120);
  const [bloodPressureDia, setBloodPressureDia] = useState(80);
  const [temperature, setTemperature] = useState(37.0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchRecords = async () => {
    try {
      const res = await api.get('/monitoring/my');
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAddReading = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/monitoring', {
        heartRate: parseInt(heartRate, 10),
        spo2: parseInt(spo2, 10),
        bloodPressureSys: parseInt(bloodPressureSys, 10),
        bloodPressureDia: parseInt(bloodPressureDia, 10),
        temperature: parseFloat(temperature),
      });
      setMessage('New vitals reading logged successfully.');
      setShowForm(false);
      fetchRecords();
    } catch (err) {
      setMessage('Failed to record vitals.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSpo2Status = (val) => {
    if (!val) return null;
    if (val < 92) return <span className="badge badge-danger">Critical (&lt;92%)</span>;
    if (val < 95) return <span className="badge badge-warning">Low ({val}%)</span>;
    return <span className="badge badge-success">Normal ({val}%)</span>;
  };

  const getBpStatus = (sys, dia) => {
    if (!sys || !dia) return null;
    if (sys >= 140 || dia >= 90) return <span className="badge badge-danger">High ({sys}/{dia})</span>;
    if (sys >= 130 || dia >= 85) return <span className="badge badge-warning">Elevated ({sys}/{dia})</span>;
    return <span className="badge badge-success">Normal ({sys}/{dia})</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <HeartPulse size={26} color="var(--secondary)" />
            {t('healthMonitoring')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Track physiological parameters and early health warning indicators.
          </p>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>{showForm ? 'Cancel' : t('addReading')}</span>
        </button>
      </div>

      {/* College Project Architecture Note */}
      <div className="alert-box alert-info">
        <Info size={18} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.825rem' }}>
          <strong>System Note: </strong>
          Readings can be entered manually by patients or by Community Health Workers during home field visits. The REST API is designed to receive automated payloads from Bluetooth / IoT health sensors.
        </div>
      </div>

      {message && (
        <div className="alert-box alert-success">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Add Reading Modal/Form */}
      {showForm && (
        <div className="card" style={{ borderColor: 'var(--primary)' }}>
          <div className="card-header">
            <span className="card-title">
              <Activity size={18} />
              Log New Physiological Vitals
            </span>
          </div>

          <form onSubmit={handleAddReading}>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">{t('heartRate')} (bpm)</label>
                <input
                  type="number"
                  min="40"
                  max="200"
                  className="form-input"
                  required
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal: 60 - 100 bpm</span>
              </div>

              <div className="form-group">
                <label className="form-label">{t('spo2')} (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  className="form-input"
                  required
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal: ≥ 95%</span>
              </div>

              <div className="form-group">
                <label className="form-label">{t('temperature')} (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  min="34.0"
                  max="43.0"
                  className="form-input"
                  required
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal: 36.5 - 37.5 °C</span>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Blood Pressure Systolic (mmHg)</label>
                <input
                  type="number"
                  min="70"
                  max="220"
                  className="form-input"
                  required
                  value={bloodPressureSys}
                  onChange={(e) => setBloodPressureSys(e.target.value)}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal: 90 - 120 mmHg</span>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Pressure Diastolic (mmHg)</label>
                <input
                  type="number"
                  min="40"
                  max="140"
                  className="form-input"
                  required
                  value={bloodPressureDia}
                  onChange={(e) => setBloodPressureDia(e.target.value)}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Normal: 60 - 80 mmHg</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <span>{submitting ? 'Recording...' : 'Save Vitals Reading'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Historical Vitals Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Vitals Log & Warning Status</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            {t('loading')}
          </div>
        ) : records.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('recordedAt')}</th>
                <th>{t('heartRate')}</th>
                <th>{t('spo2')}</th>
                <th>{t('bloodPressure')}</th>
                <th>{t('temperature')}</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.recordedAt).toLocaleString()}</td>
                  <td>
                    <strong>{r.heartRate}</strong> bpm
                  </td>
                  <td>{getSpo2Status(r.spo2)}</td>
                  <td>{getBpStatus(r.bloodPressureSys, r.bloodPressureDia)}</td>
                  <td>
                    <span className={r.temperature > 38.0 ? 'badge badge-danger' : 'badge badge-gray'}>
                      {r.temperature} °C
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info">{r.recordedBy}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No vitals history recorded yet. Click "Log New Reading" to start tracking.
          </div>
        )}
      </div>
    </div>
  );
}
