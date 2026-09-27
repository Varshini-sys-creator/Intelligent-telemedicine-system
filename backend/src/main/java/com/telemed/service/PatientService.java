package com.telemed.service;

import com.telemed.dto.PatientProfileDTO;
import com.telemed.entity.Patient;
import com.telemed.entity.Role;
import com.telemed.entity.User;
import com.telemed.exception.ApiException;
import com.telemed.repository.PatientRepository;
import com.telemed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    public Patient getPatientByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Patient profile not found", HttpStatus.NOT_FOUND));
    }

    public Patient getPatientById(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ApiException("Patient not found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Patient updateProfile(String email, PatientProfileDTO dto) {
        Patient patient = getPatientByEmail(email);

        // Update user-level fields
        User user = patient.getUser();
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getLanguagePreference() != null) user.setLanguagePreference(dto.getLanguagePreference());
        userRepository.save(user);

        // Update patient-specific fields
        if (dto.getAge() != null) patient.setAge(dto.getAge());
        if (dto.getGender() != null) patient.setGender(dto.getGender());
        if (dto.getBloodGroup() != null) patient.setBloodGroup(dto.getBloodGroup());
        if (dto.getVillageCommunity() != null) patient.setVillageCommunity(dto.getVillageCommunity());
        if (dto.getDistrict() != null) patient.setDistrict(dto.getDistrict());
        if (dto.getEmergencyContact() != null) patient.setEmergencyContact(dto.getEmergencyContact());
        if (dto.getMedicalHistorySummary() != null) patient.setMedicalHistorySummary(dto.getMedicalHistorySummary());

        return patientRepository.save(patient);
    }
}
