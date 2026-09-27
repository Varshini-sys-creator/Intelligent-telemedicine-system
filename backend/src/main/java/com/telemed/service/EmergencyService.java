package com.telemed.service;

import com.telemed.entity.*;
import com.telemed.exception.ApiException;
import com.telemed.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmergencyService {

    @Autowired
    private EmergencyRequestRepository emergencyRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public EmergencyRequest triggerSOS(String patientEmail, Double latitude, Double longitude, String locationAddress, String emergencyType) {
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Patient profile not found", HttpStatus.NOT_FOUND));

        EmergencyRequest request = EmergencyRequest.builder()
                .patient(patient)
                .latitude(latitude)
                .longitude(longitude)
                .locationAddress(locationAddress)
                .emergencyType(emergencyType != null ? emergencyType : "GENERAL_MEDICAL")
                .status("ACTIVE")
                .build();

        return emergencyRepository.save(request);
    }

    public List<EmergencyRequest> getActiveEmergencies() {
        return emergencyRepository.findByStatusOrderByTriggeredAtDesc("ACTIVE");
    }

    public List<EmergencyRequest> getPatientEmergencies(String patientEmail) {
        User user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Patient profile not found", HttpStatus.NOT_FOUND));
        return emergencyRepository.findByPatientIdOrderByTriggeredAtDesc(patient.getId());
    }

    @Transactional
    public EmergencyRequest resolveEmergency(Long id) {
        EmergencyRequest request = emergencyRepository.findById(id)
                .orElseThrow(() -> new ApiException("Emergency request not found", HttpStatus.NOT_FOUND));
        request.setStatus("RESOLVED");
        request.setResolvedAt(LocalDateTime.now());
        return emergencyRepository.save(request);
    }
}
