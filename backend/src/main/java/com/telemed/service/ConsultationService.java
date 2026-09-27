package com.telemed.service;

import com.telemed.dto.ConsultationRequestDTO;
import com.telemed.dto.ConsultationStatusUpdateDTO;
import com.telemed.entity.*;
import com.telemed.exception.ApiException;
import com.telemed.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * Consultation lifecycle management.
 *
 * Valid status transitions:
 * REQUESTED -> ACCEPTED or REJECTED (by doctor)
 * ACCEPTED  -> ONGOING (when either party joins the call)
 * ONGOING   -> COMPLETED (doctor marks it done)
 * Any state -> CANCELLED (patient can cancel before ONGOING)
 */
@Service
public class ConsultationService {

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Consultation requestConsultation(String patientEmail, ConsultationRequestDTO dto) {
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Patient profile not found", HttpStatus.NOT_FOUND));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ApiException("Doctor not found", HttpStatus.NOT_FOUND));

        Consultation consultation = Consultation.builder()
                .patient(patient)
                .doctor(doctor)
                .symptomSummary(dto.getSymptomSummary())
                .consultationType(dto.getConsultationType() != null ? dto.getConsultationType() : "VIDEO")
                .status(ConsultationStatus.REQUESTED)
                .build();

        if (dto.getScheduledTime() != null && !dto.getScheduledTime().isBlank()) {
            try {
                consultation.setScheduledTime(LocalDateTime.parse(dto.getScheduledTime()));
            } catch (DateTimeParseException e) {
                // Ignore invalid date — consultation still created without scheduled time
            }
        }

        return consultationRepository.save(consultation);
    }

    public List<Consultation> getConsultationsForPatient(String patientEmail) {
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Patient profile not found", HttpStatus.NOT_FOUND));
        return consultationRepository.findByPatientIdOrderByRequestedDateDesc(patient.getId());
    }

    public List<Consultation> getConsultationsForDoctor(String doctorEmail) {
        User user = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Doctor profile not found", HttpStatus.NOT_FOUND));
        return consultationRepository.findByDoctorIdOrderByRequestedDateDesc(doctor.getId());
    }

    public Consultation getConsultationById(Long id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Consultation not found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Consultation updateStatus(Long consultationId, String userEmail, String userRole, ConsultationStatusUpdateDTO dto) {
        Consultation consultation = getConsultationById(consultationId);
        ConsultationStatus newStatus;

        try {
            newStatus = ConsultationStatus.valueOf(dto.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException("Invalid status: " + dto.getStatus(), HttpStatus.BAD_REQUEST);
        }

        // Validate the transition is legal
        validateStatusTransition(consultation.getStatus(), newStatus, userRole);

        consultation.setStatus(newStatus);

        if (dto.getMeetingLink() != null && !dto.getMeetingLink().isBlank()) {
            consultation.setMeetingLink(dto.getMeetingLink());
        }

        return consultationRepository.save(consultation);
    }

    private void validateStatusTransition(ConsultationStatus current, ConsultationStatus next, String role) {
        boolean valid = switch (current) {
            case REQUESTED -> next == ConsultationStatus.ACCEPTED
                    || next == ConsultationStatus.REJECTED
                    || next == ConsultationStatus.CANCELLED;
            case ACCEPTED -> next == ConsultationStatus.ONGOING
                    || next == ConsultationStatus.CANCELLED;
            case ONGOING -> next == ConsultationStatus.COMPLETED;
            case COMPLETED, REJECTED, CANCELLED -> false; // Terminal states
        };

        if (!valid) {
            throw new ApiException(
                    "Cannot change consultation status from " + current + " to " + next,
                    HttpStatus.BAD_REQUEST
            );
        }
    }
}
