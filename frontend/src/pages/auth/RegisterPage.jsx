import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('ROLE_PATIENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [languagePreference, setLanguagePreference] = useState('en');

  // Patient fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [villageCommunity, setVillageCommunity] = useState('');
  const [district, setDistrict] = useState('Coimbatore');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Doctor fields
  const [specialization, setSpecialization] = useState('General Medicine');
  const [qualification, setQualification] = useState('MBBS');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('');

  // CHW fields
  const [assignedRegion, setAssignedRegion] = useState('');
  const [assignedDistrict, setAssignedDistrict] = useState('Coimbatore');
  const [centerName, setCenterName] = useState('');

  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      fullName,
      email,
      password,
      role,
      phone,
      languagePreference,
      ...(role === 'ROLE_PATIENT' && {
        age: age ? parseInt(age, 10) : null,
        gender,
        bloodGroup,
        villageCommunity,
        district,
        emergencyContact
      }),
      ...(role === 'ROLE_DOCTOR' && {
        specialization,
        qualification,
        licenseNumber,
        hospitalAffiliation
      }),
      ...(role === 'ROLE_CHW' && {
        assignedRegion,
        assignedDistrict,
        centerName
      })
    };

    const res = await register(payload);
    if (res.success) {
      if (role === 'ROLE_PATIENT') navigate('/patient');
      else if (role === 'ROLE_DOCTOR') navigate('/doctor');
      else if (role === 'ROLE_CHW') navigate('/chw');
    } else {
      setError(res.message);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        Create an Account
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Register as a patient, remote medical officer, or community health worker.
      </p>

      {error && (
        <div className="alert-box alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Role selector */}
        <div className="form-group">
          <label className="form-label">I am registering as:</label>
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="ROLE_PATIENT">Patient (Rural/Tribal Resident)</option>
            <option value="ROLE_DOCTOR">Doctor / Medical Consultant</option>
            <option value="ROLE_CHW">Community Health Worker (CHW)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            required
            placeholder="e.g. Ramanathan K"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            required
            placeholder="e.g. user@telemed.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            required
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Contact Phone</label>
          <input
            type="tel"
            className="form-input"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Patient specific fields */}
        {role === 'ROLE_PATIENT' && (
          <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              PATIENT PROFILE DETAILS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 42"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Village / Tribal Settlement</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Valparai Tribal Cluster"
                value={villageCommunity}
                onChange={(e) => setVillageCommunity(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">District</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Coimbatore"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Emergency Contact Phone</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 9876543210"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Doctor specific fields */}
        {role === 'ROLE_DOCTOR' && (
          <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              DOCTOR CREDENTIALS
            </div>
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. General Medicine, Pediatrics"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Medical Council Registration / License No</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. TN-MMC-84920"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Hospital Affiliation</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. District Headquarters Hospital, Salem"
                value={hospitalAffiliation}
                onChange={(e) => setHospitalAffiliation(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* CHW specific fields */}
        {role === 'ROLE_CHW' && (
          <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              COMMUNITY HEALTH WORKER DETAILS
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Cluster / Village</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Valparai Tribal Cluster"
                value={assignedRegion}
                onChange={(e) => setAssignedRegion(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Primary Health Sub-Center</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Valparai PHC Center"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
          disabled={loading}
        >
          <UserPlus size={16} />
          <span>{loading ? 'Registering...' : 'Complete Registration'}</span>
        </button>
      </form>

      <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 600 }}>
          Sign In
        </Link>
      </div>
    </div>
  );
}
