# Intelligent Telemedicine System — Database Specification

This document details the relational database design for the **Intelligent Telemedicine System**.

---

## 1. Schema Tables Overview

| Table Name | Primary Key | Foreign Keys | Description |
| :--- | :--- | :--- | :--- |
| `users` | `id` (BIGINT) | None | Core user credentials, roles, email, hashed password, language preference |
| `patients` | `id` (BIGINT) | `user_id` -> `users.id` | Patient demographic data, village/settlement, blood group, emergency contact |
| `doctors` | `id` (BIGINT) | `user_id` -> `users.id` | Doctor medical specialization, license number, hospital affiliation |
| `chw_profiles` | `id` (BIGINT) | `user_id` -> `users.id` | Community Health Worker assigned village cluster, district, sub-center |
| `consultations`| `id` (BIGINT) | `patient_id` -> `patients.id`, `doctor_id` -> `doctors.id` | Consultation appointments, statuses, scheduled times, video room links |
| `medical_records`| `id` (BIGINT) | `patient_id`, `doctor_id`, `consultation_id` | Official clinical observations, diagnosis summary, follow-up advice |
| `prescriptions`| `id` (BIGINT) | `medical_record_id` -> `medical_records.id` | Individual medicines, dosages, frequencies (e.g. 1-0-1), and durations |
| `symptom_assessments`| `id` (BIGINT) | `patient_id` -> `patients.id` | Patient reported symptoms, AI recommendations JSON, urgency indicators |
| `health_monitoring_records`| `id` (BIGINT) | `patient_id` -> `patients.id` | Physiological readings: heart rate, SpO2, blood pressure, temperature |
| `emergency_requests`| `id` (BIGINT) | `patient_id` -> `patients.id` | Distress SOS logs with GPS coordinates, emergency category, status |
| `notifications`| `id` (BIGINT) | `user_id` -> `users.id` | User alert messages, appointment updates, read/unread flags |

---

## 2. Relationships & Referential Integrity

- **User to Role Profile (1 : 1)**: Every patient, doctor, and CHW record points to exactly one `users` row with `ON DELETE CASCADE`.
- **Patient to Consultations (1 : N)**: A patient can book multiple consultations over time.
- **Doctor to Consultations (1 : N)**: A doctor manages multiple consultation queues.
- **Consultation to Medical Record (1 : 1)**: When a consultation finishes, a single medical record is authored by the attending doctor.
- **Medical Record to Prescriptions (1 : N)**: A medical record can have multiple prescription rows, stored with `CascadeType.ALL` and `orphanRemoval = true`.
- **Patient to Vitals Readings (1 : N)**: Chronological vital records logged by patient or CHW.

---

## 3. Database Engines: H2 vs MySQL

### In-Memory H2 (Default for Instant Local Development)
- **URL**: `jdbc:h2:mem:telemedicine_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE`
- **Web Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:telemedicine_db`, User: `sa`, Password: empty)
- **Behavior**: Auto-creates tables using Hibernate `ddl-auto=update` and automatically populates realistic demo accounts via `DataInitializer.java`.

### MySQL 8.0+ (Production Profile)
To run with real MySQL:
1. Create database:
```sql
CREATE DATABASE telemedicine_db;
```
2. Execute schema and sample seed scripts:
```bash
mysql -u root -p telemedicine_db < database/schema/schema.sql
mysql -u root -p telemedicine_db < database/seed/sample_data.sql
```
3. Set environment variable or update `application.properties`:
```properties
spring.profiles.active=mysql
spring.datasource.url=jdbc:mysql://localhost:3306/telemedicine_db
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

---

## 4. Pre-Seeded Demonstration Accounts

| Role | Name | Email | Password | Details / Assigned Cluster |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | Ramanathan K | `patient@telemed.org` | `password123` | Valparai Tribal Settlement, Coimbatore |
| **Doctor** | Dr. Arun Kumar | `doctor@telemed.org` | `password123` | General Medicine, Salem Govt Hospital |
| **CHW** | Selvi M | `chw@telemed.org` | `password123` | Valparai Cluster, Primary Sub-Center |
| **Admin** | Admin Officer | `admin@telemed.org` | `password123` | System Administrator |
| **Doctor 2** | Dr. Priya Sundaram | `priya.doctor@telemed.org` | `password123` | Pediatrics & Community Health |
| **Patient 2** | Muthu P | `muthu.patient@telemed.org` | `password123` | Javadi Hills Village, Tirupathur |
