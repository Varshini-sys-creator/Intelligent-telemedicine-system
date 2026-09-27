import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { AlertTriangle, MapPin, CheckCircle, ShieldAlert, PhoneCall } from 'lucide-react';

export default function EmergencySOS() {
  const { t } = useLanguage();
  const [activeSOS, setActiveSOS] = useState(null);
  const [history, setHistory] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [emergencyType, setEmergencyType] = useState('ACUTE_RESPIRATORY_DISTRESS');
  const [locationAddress, setLocationAddress] = useState('Valparai Tribal Settlement, Tamil Nadu');
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchEmergencies = async () => {
    try {
      const res = await api.get('/emergency/my');
      setHistory(res.data);
      const active = res.data.find((e) => e.status === 'ACTIVE');
      setActiveSOS(active || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmergencies();

    // Try capturing current geolocation if permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation access denied or unavailable, using fallback cluster coordinates.');
          setCoords({ latitude: 10.3241, longitude: 76.9531 }); // Valparai coordinates
        }
      );
    }
  }, []);

  const triggerSOS = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      const res = await api.post('/emergency/sos', {
        latitude: coords.latitude || 10.3241,
        longitude: coords.longitude || 76.9531,
        locationAddress: locationAddress,
        emergencyType: emergencyType,
      });
      setActiveSOS(res.data);
      setConfirmModal(false);
      setStatusMsg(t('sosTriggeredSuccess'));
      fetchEmergencies();
    } catch (err) {
      alert('Failed to trigger emergency SOS. Please dial 108 immediately.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldAlert size={28} />
          {t('emergencyTitle')}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Immediate location-assisted emergency alert for tribal settlements and remote areas.
        </p>
      </div>

      {/* Primary Emergency Dialing Box */}
      <div style={{
        backgroundColor: '#fef2f2',
        border: '2px solid #f87171',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PhoneCall size={20} />
            National Emergency Helpline: 108 / 112
          </div>
          <div style={{ fontSize: '0.85rem', color: '#7f1d1d', marginTop: '0.2rem' }}>
            For life-threatening cardiac, obstetric, or trauma emergencies, always phone 108 directly.
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>
          Direct Govt Ambulance Link
        </div>
      </div>

      {/* SOS Trigger Card */}
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', borderColor: activeSOS ? 'var(--danger)' : 'var(--border-color)' }}>
        {activeSOS ? (
          <div>
            <div style={{
              display: 'inline-flex',
              padding: '1rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={48} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.5rem' }}>
              EMERGENCY ALERT IS ACTIVE
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1rem' }}>
              Your distress signal and GPS location have been transmitted to the local Community Health Worker team and primary response center.
            </p>

            <div style={{
              display: 'inline-block',
              textAlign: 'left',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              padding: '1rem',
              fontSize: '0.85rem'
            }}>
              <div><strong>Emergency Type: </strong> {activeSOS.emergencyType}</div>
              <div><strong>Dispatched Address: </strong> {activeSOS.locationAddress}</div>
              <div><strong>GPS Coordinates: </strong> {activeSOS.latitude}, {activeSOS.longitude}</div>
              <div><strong>Alert Triggered: </strong> {new Date(activeSOS.triggeredAt).toLocaleString()}</div>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Tribal Cluster Emergency Alert
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
              {t('emergencyDesc')}
            </p>

            <button
              onClick={() => setConfirmModal(true)}
              className="btn btn-danger"
              style={{
                fontSize: '1.1rem',
                padding: '1rem 2.5rem',
                borderRadius: '50px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                letterSpacing: '0.5px'
              }}
            >
              <AlertTriangle size={24} />
              <span>{t('triggerSosBtn')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={22} />
              Confirm Emergency SOS Broadcast
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {t('sosConfirmText')}
            </p>

            <div className="form-group">
              <label className="form-label">Type of Medical Emergency</label>
              <select
                className="form-select"
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
              >
                <option value="ACUTE_RESPIRATORY_DISTRESS">Acute Breathing Difficulty</option>
                <option value="SEVERE_CHEST_PAIN">Severe Chest Pain / Heart Symptoms</option>
                <option value="HIGH_FEVER_CONVULSION">High Fever & Convulsions (Pediatric / Adult)</option>
                <option value="TRAUMA_INJURY">Accident / Physical Trauma / Fall</option>
                <option value="OBSTETRIC_LABOUR">Maternal / Labor Emergency</option>
                <option value="SNAKE_BITE_POISONING">Snake Bite / Envenomation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Current Settlement / Landmark</label>
              <input
                type="text"
                className="form-input"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setConfirmModal(false)}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: 1, fontWeight: 700 }}
                onClick={triggerSOS}
                disabled={loading}
              >
                {loading ? 'Transmitting...' : 'CONFIRM & SEND'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History of SOS alerts */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Previous Emergency Alert Logs</span>
        </div>

        {history.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Triggered At</th>
                <th>Emergency Type</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{new Date(h.triggeredAt).toLocaleString()}</td>
                  <td style={{ fontWeight: 500 }}>{h.emergencyType}</td>
                  <td>{h.locationAddress}</td>
                  <td>
                    <span className={h.status === 'ACTIVE' ? 'badge badge-danger' : 'badge badge-success'}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No previous emergency logs recorded.
          </div>
        )}
      </div>
    </div>
  );
}
