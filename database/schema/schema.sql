-- =============================================================
-- Intelligent Telemedicine System - Database Schema Definition
-- Database Engine: MySQL 8.0+ / MariaDB
-- College Mini Project - Rural & Tribal Healthcare Focus
-- =============================================================

CREATE DATABASE IF NOT EXISTS telemedicine_db;
USE telemedicine_db;

-- 1. USERS TABLE (Core Authentication & Role Management)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ROLE_PATIENT', 'ROLE_DOCTOR', 'ROLE_CHW', 'ROLE_ADMIN')),
    phone VARCHAR(20),
    language_preference VARCHAR(10) DEFAULT 'en', -- 'en' or 'ta'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    age INT,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    village_community VARCHAR(100),
    district VARCHAR(100),
    emergency_contact VARCHAR(20),
    medical_history_summary TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    hospital_affiliation VARCHAR(150),
    is_available BOOLEAN DEFAULT TRUE,
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. COMMUNITY HEALTH WORKERS (CHW) TABLE
CREATE TABLE IF NOT EXISTS chw_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    assigned_region VARCHAR(100) NOT NULL,
    assigned_district VARCHAR(100) NOT NULL,
    center_name VARCHAR(150),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS consultations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    symptom_summary TEXT,
    consultation_type VARCHAR(20) DEFAULT 'VIDEO', -- 'VIDEO', 'AUDIO', 'IN_PERSON'
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED', -- 'REQUESTED', 'ACCEPTED', 'REJECTED', 'ONGOING', 'COMPLETED', 'CANCELLED'
    requested_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_time TIMESTAMP NULL,
    meeting_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- 6. MEDICAL RECORDS TABLE
CREATE TABLE IF NOT EXISTS medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    consultation_id BIGINT,
    clinical_notes TEXT,
    diagnosis_summary TEXT,
    follow_up_recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (consultation_id) REFERENCES consultations(id)
);

-- 7. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medical_record_id BIGINT NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL, -- e.g., '1-0-1' or 'Once daily after food'
    duration_days INT NOT NULL,
    special_instructions VARCHAR(255),
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE
);

-- 8. SYMPTOM ASSESSMENTS TABLE (AI Assistance Logs)
CREATE TABLE IF NOT EXISTS symptom_assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    raw_symptoms TEXT NOT NULL,
    duration_days INT,
    ai_suggestions_json TEXT,
    urgency_indicator VARCHAR(20) DEFAULT 'NORMAL', -- 'NORMAL', 'MODERATE', 'URGENT'
    disclaimer_acknowledged BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- 9. EMERGENCY REQUESTS TABLE (SOS Flow)
CREATE TABLE IF NOT EXISTS emergency_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    location_address VARCHAR(255),
    emergency_type VARCHAR(50) DEFAULT 'GENERAL_MEDICAL',
    status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'RESPONDED', 'RESOLVED'
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- 10. HEALTH MONITORING RECORDS TABLE (Remote Vitals)
CREATE TABLE IF NOT EXISTS health_monitoring_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    heart_rate INT, -- bpm
    spo2 INT, -- oxygen saturation %
    blood_pressure_sys INT, -- mmHg systolic
    blood_pressure_dia INT, -- mmHg diastolic
    temperature DOUBLE, -- Celsius
    recorded_by VARCHAR(20) DEFAULT 'PATIENT', -- 'PATIENT', 'CHW', 'DEVICE'
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
