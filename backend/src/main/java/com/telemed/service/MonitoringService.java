package com.telemed.service;

import com.telemed.entity.*;
import com.telemed.exception.ApiException;
import com.telemed.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MonitoringService {

    @Autowired
    private HealthMonitoringRecordRepository monitoringRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    public List<HealthMonitoringRecord> getRecordsForPatient(String patientEmail) {
        Patient patient = getPatient(patientEmail);
        return monitoringRepository.findByPatientIdOrderByRecordedAtDesc(patient.getId());
    }

    public HealthMonitoringRecord getLatestForPatient(String patientEmail) {
        Patient patient = getPatient(patientEmail);
        return monitoringRepository.findFirstByPatientIdOrderByRecordedAtDesc(patient.getId())
                .orElse(null);
    }

    @Transactional
    public HealthMonitoringRecord addReading(String userEmail, HealthMonitoringRecord reading) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        // Both patients and CHWs can submit readings
        Patient patient = reading.getPatient();
        if (patient == null || patient.getId() == null) {
            // Patient is adding their own reading
            patient = patientRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ApiException("Patient profile not found", HttpStatus.NOT_FOUND));
            reading.setPatient(patient);
        }

        String recordedBy = user.getRole() == Role.ROLE_CHW ? "CHW" : "PATIENT";
        reading.setRecordedBy(recordedBy);

        return monitoringRepository.save(reading);
    }

    private Patient getPatient(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Patient profile not found", HttpStatus.NOT_FOUND));
    }
}
