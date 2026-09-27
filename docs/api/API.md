# Intelligent Telemedicine System — REST API Specification

This document details all implemented backend REST API endpoints for the Intelligent Telemedicine System college mini project.

**Base URL**: `http://localhost:8080/api`

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Authentication**: Public (No token required)
- **Request Body**:
```json
{
  "fullName": "Ramanathan K",
  "email": "patient@telemed.org",
  "password": "password123",
  "role": "ROLE_PATIENT",
  "phone": "+91 9876543210",
  "languagePreference": "ta",
  "age": 45,
  "gender": "Male",
  "bloodGroup": "O+",
  "villageCommunity": "Valparai Tribal Settlement",
  "district": "Coimbatore",
  "emergencyContact": "+91 9876543210"
}
```
- **Success Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "patient@telemed.org",
  "fullName": "Ramanathan K",
  "role": "ROLE_PATIENT",
  "languagePreference": "ta"
}
```
- **Error Codes**: `400 Bad Request` (validation error), `409 Conflict` (email already exists).

---

### 1.2 Login User
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Authentication**: Public
- **Request Body**:
```json
{
  "email": "patient@telemed.org",
  "password": "password123"
}
```
- **Success Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "tokenType": "Bearer",
  "userId": 1,
  "email": "patient@telemed.org",
  "fullName": "Ramanathan K",
  "role": "ROLE_PATIENT",
  "languagePreference": "ta"
}
```
- **Error Codes**: `401 Unauthorized` (bad credentials).

---

## 2. Patient Endpoints

### 2.1 Get Patient Profile
- **Method**: `GET`
- **URL**: `/api/patients/profile`
- **Authentication**: `Bearer <token>` (`ROLE_PATIENT`)
- **Response (200 OK)**: Patient object with associated user and health history summary.

### 2.2 Update Patient Profile
- **Method**: `PUT`
- **URL**: `/api/patients/profile`
- **Authentication**: `Bearer <token>` (`ROLE_PATIENT`)
- **Request Body**:
```json
{
  "fullName": "Ramanathan K",
  "phone": "+91 9876543210",
  "age": 46,
  "villageCommunity": "Valparai Cluster Block 2",
  "district": "Coimbatore"
}
```

---

## 3. Doctor Endpoints

### 3.1 List Available Doctors
- **Method**: `GET`
- **URL**: `/api/doctors?specialization=General`
- **Authentication**: `Bearer <token>` (Any authenticated role)
- **Response (200 OK)**: List of available doctor profiles with hospital affiliations and qualifications.

### 3.2 Get Doctor Profile
- **Method**: `GET`
- **URL**: `/api/doctors/profile`
- **Authentication**: `Bearer <token>` (`ROLE_DOCTOR`)

---

## 4. AI Symptom Analysis

### 4.1 Analyze Symptoms
- **Method**: `POST`
- **URL**: `/api/symptoms/analyze`
- **Authentication**: `Bearer <token>` (`ROLE_PATIENT`)
- **Request Body**:
```json
{
  "symptoms": "Mild fever, cough, and throat pain for 3 days",
  "durationDays": 3,
  "age": 45,
  "additionalInfo": "Hypertension"
}
```
- **Response (200 OK)**:
```json
{
  "disclaimer": "This information is for general guidance only and is NOT a medical diagnosis. Always consult a qualified healthcare professional for medical advice.",
  "summary": "Based on the reported symptoms...",
  "possibleConditions": [
    "Common cold or upper respiratory infection",
    "Viral fever"
  ],
  "suggestions": [
    "Rest and drink warm fluids",
    "Stay hydrated — drink ORS if feeling weak"
  ],
  "urgencyLevel": "NORMAL",
  "suggestedNextStep": "Consider booking a consultation with a doctor through this app for proper evaluation."
}
```

---

## 5. Consultation Endpoints

### 5.1 Request Consultation
- **Method**: `POST`
- **URL**: `/api/consultations`
- **Authentication**: `Bearer <token>` (`ROLE_PATIENT`)
- **Request Body**:
```json
{
  "doctorId": 1,
  "symptomSummary": "Fever and mild dry cough for 3 days",
  "consultationType": "VIDEO",
  "scheduledTime": "2026-09-22T10:30:00"
}
```

### 5.2 Get User Consultations
- **Method**: `GET`
- **URL**: `/api/consultations`
- **Authentication**: `Bearer <token>`
- **Response**: List of consultations for the current patient or doctor.

### 5.3 Update Consultation Status
- **Method**: `PUT`
- **URL**: `/api/consultations/{id}/status`
- **Authentication**: `Bearer <token>`
- **Request Body**:
```json
{
  "status": "ACCEPTED",
  "meetingLink": "telemed-room-valparai-001"
}
```
*Valid transitions: REQUESTED → ACCEPTED / REJECTED / CANCELLED → ONGOING → COMPLETED*

---

## 6. Medical Records & Prescriptions

### 6.1 Get Patient Medical Records
- **Method**: `GET`
- **URL**: `/api/medical-records/my`
- **Authentication**: `Bearer <token>` (`ROLE_PATIENT`)
- **Response**: List of medical records with clinical notes and prescriptions.

### 6.2 Create Medical Record (Doctor)
- **Method**: `POST`
- **URL**: `/api/medical-records`
- **Authentication**: `Bearer <token>` (`ROLE_DOCTOR`)
- **Request Body**:
```json
{
  "patientId": 1,
  "consultationId": 1,
  "diagnosisSummary": "Mild Viral Upper Respiratory Tract Infection",
  "clinicalNotes": "Patient has stable SpO2 (98%). Advised paracetamol and hydration.",
  "followUpRecommendation": "Revisit if fever persists over 5 days.",
  "prescriptions": [
    {
      "medicineName": "Paracetamol 500mg",
      "dosage": "500mg",
      "frequency": "1-0-1 after food",
      "durationDays": 5,
      "specialInstructions": "Take with warm water"
    }
  ]
}
```

---

## 7. Remote Health Monitoring (Vitals)

### 7.1 Log Vitals Reading
- **Method**: `POST`
- **URL**: `/api/monitoring`
- **Authentication**: `Bearer <token>` (`ROLE_PATIENT` or `ROLE_CHW`)
- **Request Body**:
```json
{
  "heartRate": 74,
  "spo2": 98,
  "bloodPressureSys": 120,
  "bloodPressureDia": 80,
  "temperature": 37.0
}
```

### 7.2 Get Patient Vitals History
- **Method**: `GET`
- **URL**: `/api/monitoring/my`
- **Authentication**: `Bearer <token>` (`ROLE_PATIENT`)

### 7.3 Get Latest Vitals Reading
- **Method**: `GET`
- **URL**: `/api/monitoring/my/latest`
- **Authentication**: `Bearer <token>` (`ROLE_PATIENT`)

---

## 8. Emergency SOS

### 8.1 Trigger Emergency SOS
- **Method**: `POST`
- **URL**: `/api/emergency/sos`
- **Authentication**: `Bearer <token>` (`ROLE_PATIENT`)
- **Request Body**:
```json
{
  "latitude": 10.3241,
  "longitude": 76.9531,
  "locationAddress": "Valparai Tribal Settlement Block 4, Tamil Nadu",
  "emergencyType": "ACUTE_RESPIRATORY_DISTRESS"
}
```

### 8.2 Get Active Emergencies
- **Method**: `GET`
- **URL**: `/api/emergency/active`
- **Authentication**: `Bearer <token>` (`ROLE_CHW`, `ROLE_DOCTOR`, `ROLE_ADMIN`)

### 8.3 Resolve Emergency
- **Method**: `PUT`
- **URL**: `/api/emergency/{id}/resolve`
- **Authentication**: `Bearer <token>` (`ROLE_CHW` or `ROLE_ADMIN`)

---

## 9. Community Health Worker & Admin

### 9.1 Get CHW Cluster Patients
- **Method**: `GET`
- **URL**: `/api/chw/patients`
- **Authentication**: `Bearer <token>` (`ROLE_CHW`)

### 9.2 Disease Outbreak Analytics
- **Method**: `GET`
- **URL**: `/api/analytics/outbreak-summary`
- **Authentication**: `Bearer <token>` (`ROLE_CHW`, `ROLE_DOCTOR`, `ROLE_ADMIN`)
- **Response**: Aggregated symptom frequencies, regional patient distributions, and demonstration early warning indicators.

### 9.3 Platform Statistics
- **Method**: `GET`
- **URL**: `/api/admin/stats`
- **Authentication**: `Bearer <token>` (`ROLE_ADMIN`)

---

## 10. WebRTC Signaling (WebSocket / STOMP)

- **WebSocket Endpoint**: `http://localhost:8080/api/ws/signaling`
- **Client Publish Destination Prefix**: `/app`
  - `/app/signal/{roomId}/offer` — SDP Offer
  - `/app/signal/{roomId}/answer` — SDP Answer
  - `/app/signal/{roomId}/ice-candidate` — ICE Candidate
- **Subscribe Topic**: `/topic/signal/{roomId}/*`
