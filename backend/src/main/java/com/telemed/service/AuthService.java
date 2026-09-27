package com.telemed.service;

import com.telemed.dto.AuthResponse;
import com.telemed.dto.LoginRequest;
import com.telemed.dto.RegisterRequest;
import com.telemed.entity.*;
import com.telemed.exception.ApiException;
import com.telemed.repository.*;
import com.telemed.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles user registration and login.
 *
 * Registration creates a User + the appropriate role-specific profile (Patient/Doctor/CHW).
 * Login authenticates credentials and returns a JWT token.
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private CommunityHealthWorkerRepository chwRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check email is not already taken
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ApiException("An account with this email already exists", HttpStatus.CONFLICT);
        }

        // Admins cannot self-register — they must be created by another admin
        if (request.getRole() == Role.ROLE_ADMIN) {
            throw new ApiException("Admin accounts cannot be created through self-registration", HttpStatus.FORBIDDEN);
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .languagePreference(request.getLanguagePreference() != null ? request.getLanguagePreference() : "en")
                .build();

        user = userRepository.save(user);

        // Create the role-specific profile based on the selected role
        createRoleProfile(user, request);

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), user.getLanguagePreference());
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), user.getLanguagePreference());
    }

    private void createRoleProfile(User user, RegisterRequest request) {
        switch (user.getRole()) {
            case ROLE_PATIENT -> {
                Patient patient = Patient.builder()
                        .user(user)
                        .age(request.getAge())
                        .gender(request.getGender())
                        .bloodGroup(request.getBloodGroup())
                        .villageCommunity(request.getVillageCommunity())
                        .district(request.getDistrict())
                        .emergencyContact(request.getEmergencyContact())
                        .build();
                patientRepository.save(patient);
            }
            case ROLE_DOCTOR -> {
                if (request.getSpecialization() == null || request.getLicenseNumber() == null) {
                    throw new ApiException("Specialization and license number are required for doctor registration", HttpStatus.BAD_REQUEST);
                }
                Doctor doctor = Doctor.builder()
                        .user(user)
                        .specialization(request.getSpecialization())
                        .qualification(request.getQualification() != null ? request.getQualification() : "MBBS")
                        .licenseNumber(request.getLicenseNumber())
                        .hospitalAffiliation(request.getHospitalAffiliation())
                        .isAvailable(true)
                        .build();
                doctorRepository.save(doctor);
            }
            case ROLE_CHW -> {
                if (request.getAssignedRegion() == null || request.getAssignedDistrict() == null) {
                    throw new ApiException("Assigned region and district are required for CHW registration", HttpStatus.BAD_REQUEST);
                }
                CommunityHealthWorker chw = CommunityHealthWorker.builder()
                        .user(user)
                        .assignedRegion(request.getAssignedRegion())
                        .assignedDistrict(request.getAssignedDistrict())
                        .centerName(request.getCenterName())
                        .build();
                chwRepository.save(chw);
            }
            default -> {}
        }
    }
}
