import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { FileText, Pill, Calendar, User, Printer } from 'lucide-react';

export default function MedicalRecords() {
  const { t } = useLanguage();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get('/medical-records/my');
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={26} color="var(--primary)" />
            {t('medicalRecords')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Official consultation summaries, doctor clinical notes, and digital prescriptions.
          </p>
        </div>

        {records.length > 0 && (
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
            <Printer size={15} />
            <span>Print Records</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          {t('loading')}
        </div>
      ) : records.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {records.map((rec) => (
            <div key={rec.id} className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    Consultation with {rec.doctor?.user?.fullName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {rec.doctor?.specialization} • {rec.doctor?.hospitalAffiliation || 'District Hospital'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {new Date(rec.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Diagnosis & Notes */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Diagnosis Summary:
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  backgroundColor: 'var(--primary-light)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius)'
                }}>
                  {rec.diagnosisSummary || 'General health evaluation'}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Doctor Clinical Observations:
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {rec.clinicalNotes || 'No specific clinical observations recorded.'}
                </div>
              </div>

              {/* Prescriptions Table */}
              {rec.prescriptions && rec.prescriptions.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Pill size={16} color="var(--secondary)" />
                    <span>Prescribed Medications:</span>
                  </div>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rec.prescriptions.map((p, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.medicineName}</td>
                          <td>{p.dosage}</td>
                          <td>
                            <span className="badge badge-info">{p.frequency}</span>
                          </td>
                          <td>{p.durationDays} days</td>
                          <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                            {p.specialInstructions || 'As directed'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Follow-up instructions */}
              {rec.followUpRecommendation && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem',
                  fontSize: '0.85rem'
                }}>
                  <strong>Follow-up Recommendation: </strong>
                  {rec.followUpRecommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>
            No medical records yet
          </div>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Medical records will be generated automatically after your doctor consultations.
          </p>
        </div>
      )}
    </div>
  );
}
