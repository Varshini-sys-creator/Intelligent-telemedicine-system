package com.telemed.config;

import com.telemed.entity.*;
import com.telemed.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Initializes sample demo data when the database is empty (such as in-memory H2 dev mode).
 * Provides pre-seeded patient, doctor, CHW, and admin accounts for testing and viva demonstration.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private CommunityHealthWorkerRepository chwRepository;

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private HealthMonitoringRecordRepository monitoringRepository;

    @Autowired
    private EmergencyRequestRepository emergencyRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SymptomAssessmentRepository symptomAssessmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already contains data. Skipping demo data initialization.");
            return;
        }

        logger.info("Database is empty. Seeding initial demo healthcare data...");

        String defaultHashedPassword = passwordEncoder.encode("password123");

        // 1. Patient User 1 (Ramanathan K)
        User u1 = userRepository.save(User.builder()
                .fullName("Ramanathan K")
                .email("patient@telemed.org")
                .passwordHash(defaultHashedPassword)
                .role(Role.ROLE_PATIENT)
                .phone("+91 9876543210")
                .languagePreference("ta")
                .build());

        Patient p1 = patientRepository.save(Patient.builder()
                .user(u1)
                .age(45)
                .gender("Male")
                .bloodGroup("O+")
                .villageCommunity("Valparai Tribal Settlement")
                .district("Coimbatore")
                .emergencyContact("+91 9876543210")
                .medicalHistorySummary("Mild hypertension, seasonal allergies")
                .build());

        // 2. Doctor User 1 (Dr. Arun Kumar)
        User u2 = userRepository.save(User.builder()
                .fullName("Dr. Arun Kumar")
                .email("doctor@telemed.org")
                .passwordHash(defaultHashedPassword)
                .role(Role.ROLE_DOCTOR)
                .phone("+91 9876543211")
                .languagePreference("en")
                .build());

        Doctor d1 = doctorRepository.save(Doctor.builder()
                .user(u2)
                .specialization("General Medicine")
                .qualification("MBBS, MD (Internal Medicine)")
                .licenseNumber("TN-MMC-84920")
                .hospitalAffiliation("Government General Hospital, Salem")
                .isAvailable(true)
                .consultationFee(BigDecimal.ZERO)
                .build());

        // 3. CHW User (Selvi M)
        User u3 = userRepository.save(User.builder()
                .fullName("Selvi M (CHW)")
                .email("chw@telemed.org")
                .passwordHash(defaultHashedPassword)
                .role(Role.ROLE_CHW)
                .phone("+91 9876543212")
                .languagePreference("ta")
                .build());

        chwRepository.save(CommunityHealthWorker.builder()
                .user(u3)
                .assignedRegion("Valparai Tribal Cluster")
                .assignedDistrict("Coimbatore")
                .centerName("Valparai Primary Health Sub-Center")
                .build());

        // 4. Admin User
        userRepository.save(User.builder()
                .fullName("Admin Officer")
                .email("admin@telemed.org")
                .passwordHash(defaultHashedPassword)
                .role(Role.ROLE_ADMIN)
                .phone("+91 9876543213")
                .languagePreference("en")
                .build());

        // 5. Doctor User 2 (Dr. Priya Sundaram)
        User u5 = userRepository.save(User.builder()
                .fullName("Dr. Priya Sundaram")
                .email("priya.doctor@telemed.org")
                .passwordHash(defaultHashedPassword)
                .role(Role.ROLE_DOCTOR)
                .phone("+91 9876543214")
                .languagePreference("ta")
                .build());

        Doctor d2 = doctorRepository.save(Doctor.builder()
                .user(u5)
                .specialization("Pediatrics & Community Health")
                .qualification("MBBS, DCH")
                .licenseNumber("TN-MMC-91042")
                .hospitalAffiliation("District Headquarters Hospital, Vellore")
                .isAvailable(true)
                .consultationFee(BigDecimal.ZERO)
                .build());

        // 6. Patient User 2 (Muthu P)
        User u6 = userRepository.save(User.builder()
                .fullName("Muthu P")
                .email("muthu.patient@telemed.org")
                .passwordHash(defaultHashedPassword)
                .role(Role.ROLE_PATIENT)
                .phone("+91 9876543215")
                .languagePreference("ta")
                .build());

        Patient p2 = patientRepository.save(Patient.builder()
                .user(u6)
                .age(32)
                .gender("Male")
                .bloodGroup("B+")
                .villageCommunity("Javadi Hills Village")
                .district("Coimbatore")
                .emergencyContact("+91 9876543215")
                .medicalHistorySummary("History of viral fever in 2024")
                .build());

        // 7. Seed Consultations
        Consultation c1 = consultationRepository.save(Consultation.builder()
                .patient(p1)
                .doctor(d1)
                .symptomSummary("Fever, joint pain, and mild cough for 3 days")
                .consultationType("VIDEO")
                .status(ConsultationStatus.ACCEPTED)
                .scheduledTime(LocalDateTime.now().plusHours(2))
                .meetingLink("telemed-room-valparai-001")
                .build());

        consultationRepository.save(Consultation.builder()
                .patient(p2)
                .doctor(d2)
                .symptomSummary("Child headache, high temperature, and low appetite")
                .consultationType("VIDEO")
                .status(ConsultationStatus.REQUESTED)
                .scheduledTime(LocalDateTime.now().plusHours(5))
                .meetingLink("telemed-room-javadi-002")
                .build());

        // 8. Seed Medical Record & Prescription
        MedicalRecord mr1 = MedicalRecord.builder()
                .patient(p1)
                .doctor(d1)
                .consultation(c1)
                .clinicalNotes("Patient presents with mild fever (38.1C). SpO2 stable at 98%. Advised hydration, rest, and paracetamol.")
                .diagnosisSummary("Mild Viral Upper Respiratory Tract Infection")
                .followUpRecommendation("Revisit if fever persists beyond 5 days or if breathing difficulty develops.")
                .prescriptions(new ArrayList<>())
                .build();

        Prescription presc1 = Prescription.builder()
                .medicalRecord(mr1)
                .medicineName("Paracetamol 500mg")
                .dosage("500mg")
                .frequency("1-0-1 after food")
                .durationDays(5)
                .specialInstructions("Take with warm water")
                .build();

        Prescription presc2 = Prescription.builder()
                .medicalRecord(mr1)
                .medicineName("ORSL Hydration Solution")
                .dosage("1 packet")
                .frequency("Twice daily")
                .durationDays(3)
                .specialInstructions("Mix thoroughly in 1 Litre clean boiled water")
                .build();

        mr1.getPrescriptions().add(presc1);
        mr1.getPrescriptions().add(presc2);
        medicalRecordRepository.save(mr1);

        // 9. Health Monitoring Records (Vitals)
        monitoringRepository.save(HealthMonitoringRecord.builder()
                .patient(p1)
                .heartRate(74)
                .spo2(98)
                .bloodPressureSys(120)
                .bloodPressureDia(80)
                .temperature(37.0)
                .recordedBy("PATIENT")
                .recordedAt(LocalDateTime.now().minusDays(2))
                .build());

        monitoringRepository.save(HealthMonitoringRecord.builder()
                .patient(p1)
                .heartRate(82)
                .spo2(97)
                .bloodPressureSys(124)
                .bloodPressureDia(82)
                .temperature(38.1)
                .recordedBy("CHW")
                .recordedAt(LocalDateTime.now().minusDays(1))
                .build());

        monitoringRepository.save(HealthMonitoringRecord.builder()
                .patient(p2)
                .heartRate(88)
                .spo2(96)
                .bloodPressureSys(118)
                .bloodPressureDia(76)
                .temperature(37.5)
                .recordedBy("CHW")
                .recordedAt(LocalDateTime.now().minusHours(4))
                .build());

        // 10. Emergency SOS record
        emergencyRepository.save(EmergencyRequest.builder()
                .patient(p1)
                .latitude(10.3241)
                .longitude(76.9531)
                .locationAddress("Valparai Tribal Settlement Block 4, Tamil Nadu")
                .emergencyType("HIGH_FEVER_RESPIRATORY")
                .status("ACTIVE")
                .build());

        // 11. Notifications
        notificationRepository.save(Notification.builder()
                .user(u1)
                .title("Consultation Accepted")
                .message("Dr. Arun Kumar has accepted your video consultation request for today.")
                .isRead(false)
                .build());

        notificationRepository.save(Notification.builder()
                .user(u2)
                .title("New Consultation Request")
                .message("You have a new consultation request from Ramanathan K (Valparai).")
                .isRead(false)
                .build());

        // 12. Symptom Assessment demo record
        symptomAssessmentRepository.save(SymptomAssessment.builder()
                .patient(p1)
                .rawSymptoms("Fever, headache, dry cough")
                .durationDays(3)
                .aiSuggestionsJson("{\"summary\":\"Symptoms suggest upper respiratory viral infection.\",\"urgencyLevel\":\"NORMAL\"}")
                .urgencyIndicator("NORMAL")
                .disclaimerAcknowledged(true)
                .build());

        logger.info("Demo healthcare data initialized successfully.");
    }
}
