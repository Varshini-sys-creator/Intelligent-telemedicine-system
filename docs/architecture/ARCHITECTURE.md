# Intelligent Telemedicine System — Architecture & Engineering Design

This document details the architectural structure, design decisions, and data flow of the **Intelligent Telemedicine System for Rural & Tribal Communities**.

---

## 1. High-Level Architectural Diagram

```
+---------------------------------------------------------------------------------+
|                               PRESENTATION LAYER                                |
|                        React.js 18 + Vite + React Router                        |
|                                                                                 |
|   +-------------------+  +-------------------+  +----------------------------+  |
|   |  Patient Portal   |  |   Doctor Portal   |  |   Community Health Worker  |  |
|   |  - Dashboard      |  |  - Consultations  |  |   - Household Vitals       |  |
|   |  - Symptom Guide  |  |  - Prescriptions  |  |   - Village Directory      |  |
|   |  - Emergency SOS  |  |  - Patient Queue  |  |   - Active SOS Dispatch    |  |
|   +-------------------+  +-------------------+  +----------------------------+  |
|                            |                                |                   |
|                            | Axios HTTP / REST              | WebRTC Direct     |
|                            v                                v Media Feed        |
+----------------------------+--------------------------------+-------------------+
                             |                                |
                             v                                |
+------------------------------------------------------+      |
|              SPRING BOOT 3 REST BACKEND              |      |
|                                                      |      |
|  +------------------------------------------------+  |      |
|  |                SECURITY LAYER                  |  |      |
|  |  - Spring Security 6                           |  |      |
|  |  - JwtAuthFilter (Bearer token header parsing) |  |      |
|  |  - BCryptPasswordEncoder                       |  |      |
|  |  - Role-Based Access Control (@PreAuthorize)   |  |      |
|  +------------------------------------------------+  |      |
|                          |                           |      |
|  +-----------------------+------------------------+  |      |
|  |                 CONTROLLERS                    |  |      |
|  |  - AuthController       - PatientController    |  |      |
|  |  - DoctorController     - ConsultationControl. |  |      |
|  |  - MedicalRecordControl - SymptomController    |  |      |
|  |  - MonitoringController - EmergencyController  |  |      |
|  |  - SignalingController  - AnalyticsController  |  |      |
|  +-----------------------+------------------------+  |      |
|                          |                           |      |
|  +-----------------------+------------------------+  |      |
|  |                SERVICE LAYER                   |  |      |
|  |  - AuthService          - ConsultationService  |  |      |
|  |  - SymptomAnalysisServ. - MonitoringService    |  |      |
|  |  - EmergencyService     - MedicalRecordService |  |      |
|  +-----------------------+------------------------+  |      |
|                          |                           |      |
+--------------------------+---------------------------+      |
                           |                                  |
              +------------+------------+                     |
              |                         |                     |
              v                         v                     v
+-------------------------+  +---------------------+  +-----------------+
|      DATABASE LAYER     |  |     AI SERVICE      |  |   PEER BROWSER  |
|  - MySQL / H2 Engine    |  |  - Rule Engine      |  |  (WebRTC DTLS/  |
|  - Spring Data JPA      |  |    (Local Fallback) |  |   SRTP Media)   |
|  - Hibernate ORM        |  |  - Google Gemini API|  |                 |
+-------------------------+  +---------------------+  +-----------------+
```

---

## 2. WebRTC Video Consultation Architecture

### How P2P Video Works in This Project
1. **Signaling Exchange (via Backend WebSocket / STOMP)**:
   - When a patient enters a room (`/consultation/room/{roomId}`), browser initiates WebRTC `RTCPeerConnection`.
   - Browser asks STUN server (`stun.l.google.com:19302`) for its public NAT address and candidates.
   - An SDP Offer is sent to the signaling server.
   - When the doctor enters the same room, their browser receives the offer and responds with an SDP Answer.
2. **Direct Peer Media Streaming**:
   - Once ICE candidates are exchanged, audio and video streams flow directly between patient and doctor browsers via DTLS-SRTP.
   - Video media **never** traverses the application backend server, guaranteeing patient privacy and avoiding server bandwidth overload.
3. **Graceful Fallback**:
   - For offline or intermittent rural networks, audio-only consultation is supported.

---

## 3. Security & Access Control Model

### Authentication Flow
1. User provides credentials to `POST /api/auth/login`.
2. `AuthService` verifies password hash using BCrypt.
3. `JwtUtils` generates a cryptographically signed HMAC-SHA256 JWT containing user identity and role claim.
4. React frontend saves token in `localStorage` and injects it into all subsequent HTTP requests via Axios request interceptor (`Authorization: Bearer <token>`).
5. `JwtAuthFilter` intercepts incoming requests, verifies signature and expiration, and creates a `SecurityContext`.
6. Endpoints protected with `@PreAuthorize("hasRole('PATIENT')")` ensure strict isolation.

### Role Authorization Matrix

| Feature | Patient | Doctor | Community Health Worker | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Self Registration | Yes | Yes | Yes | No (Pre-seeded) |
| Profile Management | Own profile | Own profile | Own profile | System view |
| AI Symptom Guide | Yes | No | Yes | View only |
| Request Consultation | Yes | No | Assisted | View stats |
| Accept/Decline Consult | No | Yes | No | View stats |
| Conduct Video Call | Yes | Yes | Assisted | No |
| Write Prescription | No | Yes | No | No |
| View Medical Records | Own only | Assigned | Cluster | Aggregated |
| Log Vitals Readings | Own | Yes | Field visit | System view |
| Emergency SOS Trigger | Yes | No | No | No |
| Resolve Emergency SOS | No | No | Yes | Yes |
| Outbreak Analytics | No | Yes | Yes | Yes |
| User Account Deletion | No | No | No | Yes |

---

## 4. AI Symptom Analysis Design

- **Separation of Concerns**: The AI engine is decoupled from the frontend. The React client never handles secret Gemini API keys.
- **Dual Mode Operation**:
  1. *Local Rule Engine (Primary)*: Deterministic symptom categorization covering respiratory, gastrointestinal, fever, and acute conditions with zero external cloud dependencies.
  2. *Gemini API (Optional Live Mode)*: If `telemed.gemini.apiKey` is configured, prompts the generative language model to format informational guidance.
- **Medical Ethics & Legal Boundary**:
  - The response is always preceded by an explicit disclaimer banner: *"This information is for general educational guidance only and is NOT a clinical diagnosis."*
  - Urgency indicators (NORMAL, MODERATE, URGENT) prioritize patient safety and direct critical cases to 108 emergency lines.
