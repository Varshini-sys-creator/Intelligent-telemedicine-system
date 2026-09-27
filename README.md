# Intelligent Telemedicine System
### AI-Powered Healthcare for Remote & Tribal Communities

A full-stack, production-grade 3rd-year college mini project engineered to bridge the healthcare gap between rural/tribal settlements and specialized medical doctors.

---

## 1. Problem Statement

Rural and tribal communities across India face acute barriers to primary and specialized healthcare:
- **Severe Shortage of Specialist Doctors**: Most specialist doctors are concentrated in Tier 1 and Tier 2 cities.
- **Geographical & Travel Burdens**: Tribal hamlets often require hours of walking or expensive private transport to reach the nearest Primary Health Center (PHC).
- **Delayed Intervention**: Early symptoms of chronic or infectious conditions frequently go neglected until severe complications arise.
- **Fragmented Medical Records**: Paper prescriptions are easily damaged, lost, or illegible.
- **Language Barriers**: Linguistic gaps between rural patients and urban specialists lead to miscommunication of symptoms.

---

## 2. Proposed Solution

The **Intelligent Telemedicine System** introduces an accessible, multi-lingual healthcare ecosystem:
1. **AI-Assisted Preliminary Symptom Guidance**: Educates patients regarding possible conditions, self-care, and urgency before seeing a doctor.
2. **Tamil & Local-Language Voice Assistance**: Integrated speech-to-text allowing non-literate and tribal patients to articulate symptoms verbally.
3. **Peer-to-Peer WebRTC Video Consultation**: Secure, encrypted direct video calls between patients and doctors with zero video storage overhead.
4. **Community Health Worker (CHW) Portal**: Equips village health workers to record vitals during home visits and follow up on high-risk patients.
5. **Emergency SOS with Geolocation**: Immediate one-click distress alert dispatching GPS coordinates and medical emergency type to responders.
6. **Digital Health Records & E-Prescriptions**: Chronological history of verified clinical observations and prescription slips.
7. **Disease Outbreak Demonstration Analytics**: Aggregates community symptom trends to provide early warning indicators of cluster outbreaks.

---

## 3. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js 18, Vite, React Router v6, Axios, Lucide Icons, Web Speech API |
| **Backend** | Java 17, Spring Boot 3.2.3, Spring Security 6, Spring Data JPA, STOMP / WebSocket |
| **Authentication** | JWT (JSON Web Tokens) with HMAC-SHA256, BCrypt Password Hashing |
| **Database** | MySQL 8.0+ / H2 In-Memory Database (automatic zero-config local mode) |
| **Video Calls** | WebRTC (Real-Time Communications) with Google STUN (`stun.l.google.com:19302`) |
| **AI Engine** | Local Rule-Based Medical Categorizer + Google Gemini API Integration |

---

## 4. Project Structure

```
intelligent-telemedicine-system/
├── backend/
│   ├── src/main/java/com/telemed/
│   │   ├── config/            # SecurityConfig, CorsConfig, WebSocketConfig, DataInitializer
│   │   ├── controller/        # Auth, Patient, Doctor, Consultation, Records, Symptoms, Emergency, CHW, Admin
│   │   ├── dto/               # Request and Response Data Transfer Objects
│   │   ├── entity/            # JPA Entities (User, Patient, Doctor, Consultation, Record, etc.)
│   │   ├── exception/         # ApiException, GlobalExceptionHandler (safe JSON errors)
│   │   ├── repository/        # Spring Data JPA Repositories
│   │   ├── security/          # JwtUtils, JwtAuthFilter, UserDetailsServiceImpl
│   │   ├── service/           # Business logic and transaction management
│   │   └── TelemedicineApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, Sidebar, ProtectedRoute
│   │   ├── context/           # AuthContext (JWT session), LanguageContext (EN/TA)
│   │   ├── layouts/           # MainLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── auth/          # LoginPage, RegisterPage
│   │   │   ├── patient/       # PatientDashboard, SymptomChecker, BookConsultation,
│   │   │   │                  # MyConsultations, MedicalRecords, HealthMonitoring, EmergencySOS
│   │   │   ├── doctor/        # DoctorDashboard, AddMedicalRecord
│   │   │   ├── chw/           # ChwDashboard
│   │   │   ├── admin/         # AdminDashboard (User admin + Outbreak Analytics)
│   │   │   └── consultation/  # VideoConsultation (WebRTC)
│   │   ├── services/          # api.js (Axios with auto Bearer injection)
│   │   ├── utils/             # translations.js (Bilingual English/Tamil strings)
│   │   ├── App.jsx
│   │   ├── index.css          # Healthcare UI Theme
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── schema/schema.sql      # Full MySQL table definition script
│   └── seed/sample_data.sql   # Realistic Tamil Nadu demo healthcare data
│
├── docs/
│   ├── api/API.md             # REST API specification
│   ├── architecture/          # Architectural diagrams & flows
│   └── database/DATABASE.md   # Entity relationships and schemas
│
├── .env.example               # Example environment variable template
├── .gitignore
└── README.md
```

---

## 5. Demonstration Accounts (Viva Evaluators)

All accounts share the default password: `password123`

| Role | User Name | Email | Password | Context |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | Ramanathan K | `patient@telemed.org` | `password123` | Valparai Tribal Cluster |
| **Doctor** | Dr. Arun Kumar | `doctor@telemed.org` | `password123` | General Medicine, Salem GH |
| **CHW** | Selvi M | `chw@telemed.org` | `password123` | Valparai Primary Sub-Center |
| **Admin** | Admin Officer | `admin@telemed.org` | `password123` | Health Directorate Admin |

> *Tip: The Login page contains one-click demo autofill buttons for each role to facilitate live examiner evaluation!*

---

## 6. How to Run Locally

### Step 1: Clone and Navigate
```bash
git clone <your-repo-url>
cd intelligent-telemedicine-system
```

### Step 2: Start the Backend (Spring Boot)
The project is configured by default to run with an in-memory H2 database with automatic schema creation and demo data seeding. No local MySQL installation is required to start immediately!

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
*The backend REST API will start on `http://localhost:8080`.*
*The H2 Database Console is accessible at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:telemedicine_db`, Username: `sa`, Password: empty).*

### Step 3: Start the Frontend (React.js + Vite)
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your web browser.*

---

## 7. Switching to MySQL (Production Mode)

1. Open MySQL workbench or command line:
```sql
CREATE DATABASE telemedicine_db;
```
2. Import schema and demo records:
```bash
mysql -u root -p telemedicine_db < database/schema/schema.sql
mysql -u root -p telemedicine_db < database/seed/sample_data.sql
```
3. Update `backend/src/main/resources/application.properties`:
```properties
spring.profiles.active=mysql
spring.datasource.url=jdbc:mysql://localhost:3306/telemedicine_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

---

## 8. College Viva & Technical Review Q&A

### Q1: Why did you choose JWT for authentication instead of HTTP Sessions?
**Answer**: JWT (JSON Web Tokens) makes our architecture stateless. The server does not maintain session tables in RAM, making it easily scalable across multiple instances (e.g. AWS EC2 auto-scaling). Each token contains signed claims (user ID, email, role) validated cryptographically via HMAC-SHA256 on every request.

### Q2: How does React communicate with Spring Boot?
**Answer**: Through RESTful HTTP APIs. We created an Axios client instance in `frontend/src/services/api.js` configured with a request interceptor. Whenever a user logs in, the JWT token is stored in `localStorage` and automatically injected as an `Authorization: Bearer <token>` header for all protected API calls.

### Q3: How is patient password security handled?
**Answer**: Passwords are never stored in plaintext. We utilize Spring Security's `BCryptPasswordEncoder` with automated salting. When a user registers or logs in, BCrypt generates a one-way mathematical hash that prevents rainbow table and brute-force attacks.

### Q4: How does WebRTC establish a direct video connection?
**Answer**: WebRTC requires a signaling mechanism to negotiate connection parameters. We configured Spring Boot with WebSocket/STOMP (`/api/ws/signaling`). When two peers join a room, they exchange SDP (Session Description Protocol) offers, answers, and ICE candidates gathered from Google STUN servers (`stun.l.google.com:19302`). Once negotiated, media streams flow directly between browsers using DTLS-SRTP encryption without taxing server bandwidth.

### Q5: How is medical privacy maintained between roles?
**Answer**: Through Spring Security method-level authorization (`@PreAuthorize`).
- `ROLE_PATIENT` can only fetch their own profile and medical records (`/api/medical-records/my`).
- `ROLE_DOCTOR` can only create records for authorized consultations.
- `ROLE_ADMIN` has oversight of user accounts and statistics but cannot inspect private consultation notes.

### Q6: How does the AI Symptom Analysis feature work without pretending to be a doctor?
**Answer**: We engineered the AI service with an ethical healthcare disclaimer: *"This information is for general educational guidance only and is NOT a medical diagnosis."* The system uses a local rule-based engine covering respiratory, gastrointestinal, and acute conditions (with an optional Google Gemini API fallback). It categorizes urgency into NORMAL, MODERATE, or URGENT and guides the patient to consult a doctor.

### Q7: How does the Emergency SOS workflow operate?
**Answer**: When a patient clicks the Emergency SOS button, the browser captures the device's GPS coordinates via the HTML5 Geolocation API (`navigator.geolocation`). The patient confirms the emergency category (e.g. acute breathing, cardiac distress, snake bite), which dispatches an active record to `POST /api/emergency/sos`. Community Health Workers in that district see the live SOS on their dashboard with the exact settlement address and can mark it responded.

### Q8: How is bilingual (Tamil/English) accessibility achieved?
**Answer**: We built a lightweight `LanguageContext` coupled with a flat key-value translation resource (`translations.js`). The active language preference is persisted in `localStorage`. For non-literate patients, we integrated the browser's native Web Speech API (`webkitSpeechRecognition`) configured for `ta-IN` (Tamil) and `en-IN` (English) so patients can verbally state symptoms.

### Q9: What is the purpose of the Community Health Worker (CHW) role?
**Answer**: In rural tribal settlements, patients often lack personal smartphones. The CHW bridges this gap using their dedicated tablet/dashboard. They can conduct household visits, record field vitals (heart rate, SpO2, blood pressure, temperature), monitor patients with chronic illnesses, and connect patients to doctors.

### Q10: How does Disease Outbreak Analysis function?
**Answer**: The backend `AnalyticsController` aggregates incoming symptom assessments and vitals by symptom category and geographical district. If multiple patients within a single cluster report high fever within 7 days, the system triggers an early warning alert (e.g. *"Elevated fever incidence in Valparai cluster — Recommend water testing and household visits"*).

---

## 9. Future Scope

1. **Wearable IoT Bluetooth Integration**: Direct Bluetooth Low Energy (BLE) integration with pulse oximeters and digital BP cuffs.
2. **Offline-First PWA Support**: Service workers enabling local queuing of vitals when cellular connectivity drops in mountainous tribal terrain.
3. **Automated SMS Reminders**: Integration with national SMS gateways for appointment and prescription adherence alerts.
4. **AWS Production Deployment**: Containerization with Docker, deployment on AWS ECS/EC2 with Amazon RDS MySQL and AWS S3 for record archival.

---

## 10. Team Contribution

- **Student Name 1**: Full-stack Architecture, Spring Boot Security & JWT Implementation
- **Student Name 2**: React.js Frontend, WebRTC Video Consultation & Speech API
- **Student Name 3**: Database Design, MySQL Schema, and Community Health Worker Module
- **Student Name 4**: AI Symptom Guide, Outbreak Analytics & Project Documentation
