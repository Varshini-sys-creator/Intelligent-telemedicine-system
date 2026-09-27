-- =============================================================
-- Intelligent Telemedicine System - Realistic Demo Seed Data
-- Passwords for all demo accounts: password123
-- =============================================================

USE telemedicine_db;

-- 1. Insert Users (Password: password123)
-- BCrypt Hash: $2a$10$e8W/2sS8pLp.O/bLd1h47.p2yT1y8aK9rM7pW5Z8x9q.2Y7v8a
INSERT INTO users (id, full_name, email, password_hash, role, phone, language_preference) VALUES
(1, 'Ramanathan K (Patient)', 'patient@telemed.org', '$2a$10$e8W/2sS8pLp.O/bLd1h47.p2yT1y8aK9rM7pW5Z8x9q.2Y7v8a', 'ROLE_PATIENT', '+91 9876543210', 'ta'),
(2, 'Dr. Arun Kumar (General Physician)', 'doctor@telemed.org', '$2a$10$e8W/2sS8pLp.O/bLd1h47.p2yT1y8aK9rM7pW5Z8x9q.2Y7v8a', 'ROLE_DOCTOR', '+91 9876543211', 'en'),
(3, 'Selvi M (Community Health Worker)', 'chw@telemed.org', '$2a$10$e8W/2sS8pLp.O/bLd1h47.p2yT1y8aK9rM7pW5Z8x9q.2Y7v8a', 'ROLE_CHW', '+91 9876543212', 'ta'),
(4, 'Admin User', 'admin@telemed.org', '$2a$10$e8W/2sS8pLp.O/bLd1h47.p2yT1y8aK9rM7pW5Z8x9q.2Y7v8a', 'ROLE_ADMIN', '+91 9876543213', 'en'),
(5, 'Dr. Priya Sundaram (Pediatrician)', 'priya.doctor@telemed.org', '$2a$10$e8W/2sS8pLp.O/bLd1h47.p2yT1y8aK9rM7pW5Z8x9q.2Y7v8a', 'ROLE_DOCTOR', '+91 9876543214', 'ta'),
(6, 'Muthu P (Patient - Tribal Village)', 'muthu.patient@telemed.org', '$2a$10$e8W/2sS8pLp.O/bLd1h47.p2yT1y8aK9rM7pW5Z8x9q.2Y7v8a', 'ROLE_PATIENT', '+91 9876543215', 'ta');

-- 2. Insert Patients Profile
INSERT INTO patients (id, user_id, age, gender, blood_group, village_community, district, emergency_contact, medical_history_summary) VALUES
(1, 1, 45, 'Male', 'O+', 'Valparai Tribal Settlement', 'Coimbatore', '+91 9876543210', 'Mild hypertension, seasonal allergies'),
(2, 6, 32, 'Male', 'B+', 'Javadi Hills Village', 'Tirupathur', '+91 9876543215', 'History of viral fever in 2024');

-- 3. Insert Doctors Profile
INSERT INTO doctors (id, user_id, specialization, qualification, license_number, hospital_affiliation, is_available, consultation_fee) VALUES
(1, 2, 'General Medicine', 'MBBS, MD (Internal Medicine)', 'TN-MMC-84920', 'Government General Hospital, Salem', TRUE, 0.00),
(2, 5, 'Pediatrics & Community Health', 'MBBS, DCH', 'TN-MMC-91042', 'District Headquarters Hospital, Vellore', TRUE, 0.00);

-- 4. Insert CHW Profile
INSERT INTO chw_profiles (id, user_id, assigned_region, assigned_district, center_name) VALUES
(1, 3, 'Valparai Tribal Cluster', 'Coimbatore District', 'Valparai Primary Health Sub-Center');

-- 5. Insert Consultations
INSERT INTO consultations (id, patient_id, doctor_id, symptom_summary, consultation_type, status, scheduled_time, meeting_link) VALUES
(1, 1, 1, 'Fever, joint pain, and mild cough for 3 days', 'VIDEO', 'ACCEPTED', NOW(), 'telemed-room-valparai-001'),
(2, 2, 2, 'Child headache and low appetite', 'VIDEO', 'REQUESTED', NOW(), 'telemed-room-javadi-002');

-- 6. Insert Medical Records & Prescriptions
INSERT INTO medical_records (id, patient_id, doctor_id, consultation_id, clinical_notes, diagnosis_summary, follow_up_recommendation) VALUES
(1, 1, 1, 1, 'Patient presents with mild fever (38.1C). SpO2 stable at 98%. Advised hydration, rest, and paracetamol.', 'Mild Viral Upper Respiratory Tract Infection', 'Revisit if fever persists beyond 5 days or if breathing difficulty develops.');

INSERT INTO prescriptions (id, medical_record_id, medicine_name, dosage, frequency, duration_days, special_instructions) VALUES
(1, 1, 'Paracetamol 500mg', '500mg', '1-0-1 after food', 5, 'Take with warm water'),
(2, 1, 'ORSL Hydration Solution', '1 packet', 'Twice daily', 3, 'Mix thoroughly in 1 Litre clean boiled water');

-- 7. Insert Health Monitoring Records (Vitals)
INSERT INTO health_monitoring_records (patient_id, heart_rate, spo2, blood_pressure_sys, blood_pressure_dia, temperature, recorded_by) VALUES
(1, 74, 98, 120, 80, 37.0, 'PATIENT'),
(1, 82, 97, 124, 82, 38.1, 'CHW'),
(2, 88, 96, 118, 76, 37.5, 'CHW');

-- 8. Insert Emergency Request (Demo SOS)
INSERT INTO emergency_requests (id, patient_id, latitude, longitude, location_address, emergency_type, status) VALUES
(1, 1, 10.3241, 76.9531, 'Valparai Tribal Settlement Block 4, Tamil Nadu', 'HIGH_FEVER_RESPIRATORY', 'ACTIVE');

-- 9. Insert Demo Notifications
INSERT INTO notifications (user_id, title, message) VALUES
(1, 'Consultation Accepted', 'Dr. Arun Kumar has accepted your consultation request for today.'),
(2, 'New Consultation Request', 'You have a new consultation request from Ramanathan K (Valparai).');
