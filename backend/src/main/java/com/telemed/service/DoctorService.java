package com.telemed.service;

import com.telemed.dto.DoctorProfileDTO;
import com.telemed.entity.Doctor;
import com.telemed.entity.User;
import com.telemed.exception.ApiException;
import com.telemed.repository.DoctorRepository;
import com.telemed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Doctor> getAllAvailableDoctors() {
        return doctorRepository.findByIsAvailableTrue();
    }

    public List<Doctor> searchBySpecialization(String specialization) {
        return doctorRepository.findBySpecializationContainingIgnoreCase(specialization);
    }

    public Doctor getDoctorByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Doctor profile not found", HttpStatus.NOT_FOUND));
    }

    public Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ApiException("Doctor not found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Doctor updateProfile(String email, DoctorProfileDTO dto) {
        Doctor doctor = getDoctorByEmail(email);

        User user = doctor.getUser();
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        userRepository.save(user);

        if (dto.getSpecialization() != null) doctor.setSpecialization(dto.getSpecialization());
        if (dto.getQualification() != null) doctor.setQualification(dto.getQualification());
        if (dto.getHospitalAffiliation() != null) doctor.setHospitalAffiliation(dto.getHospitalAffiliation());
        if (dto.getIsAvailable() != null) doctor.setIsAvailable(dto.getIsAvailable());

        return doctorRepository.save(doctor);
    }
}
