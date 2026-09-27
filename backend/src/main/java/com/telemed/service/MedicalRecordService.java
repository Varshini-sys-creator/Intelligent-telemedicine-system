package com.telemed.service;

import com.telemed.dto.MedicalRecordDTO;
import com.telemed.dto.PrescriptionDTO;
import com.telemed.entity.*;
import com.telemed.exception.ApiException;
import com.telemed.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private UserRepository userRepository;

    // Patient can only access their own records
    public List<MedicalRecord> getRecordsForPatient(String patientEmail) {
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Patient not found", HttpStatus.NOT_FOUND));
        return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
    }

    // Doctor creates a medical record for a consultation
    @Transactional
    public MedicalRecord createRecord(String doctorEmail, MedicalRecordDTO dto) {
        User doctorUser = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Doctor doctor = doctorRepository.findByUserId(doctorUser.getId())
                .orElseThrow(() -> new ApiException("Doctor profile not found", HttpStatus.NOT_FOUND));
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ApiException("Patient not found", HttpStatus.NOT_FOUND));

        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .clinicalNotes(dto.getClinicalNotes())
                .diagnosisSummary(dto.getDiagnosisSummary())
                .followUpRecommendation(dto.getFollowUpRecommendation())
                .build();

        if (dto.getConsultationId() != null) {
            consultationRepository.findById(dto.getConsultationId())
                    .ifPresent(record::setConsultation);
        }

        // Add prescriptions
        if (dto.getPrescriptions() != null) {
            for (PrescriptionDTO pDto : dto.getPrescriptions()) {
                if (pDto.getMedicineName() != null && !pDto.getMedicineName().isBlank()) {
                    Prescription prescription = Prescription.builder()
                            .medicalRecord(record)
                            .medicineName(pDto.getMedicineName())
                            .dosage(pDto.getDosage() != null ? pDto.getDosage() : "As directed")
                            .frequency(pDto.getFrequency() != null ? pDto.getFrequency() : "As directed")
                            .durationDays(pDto.getDurationDays() != null ? pDto.getDurationDays() : 1)
                            .specialInstructions(pDto.getSpecialInstructions())
                            .build();
                    record.getPrescriptions().add(prescription);
                }
            }
        }

        return medicalRecordRepository.save(record);
    }

    public MedicalRecord getRecordById(Long id, String userEmail) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ApiException("Medical record not found", HttpStatus.NOT_FOUND));
        // Authorization check: patient can only see their own records
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        if (user.getRole() == Role.ROLE_PATIENT) {
            Patient patient = patientRepository.findByUserId(user.getId()).orElse(null);
            if (patient == null || !record.getPatient().getId().equals(patient.getId())) {
                throw new ApiException("Access denied", HttpStatus.FORBIDDEN);
            }
        }
        return record;
    }
}
