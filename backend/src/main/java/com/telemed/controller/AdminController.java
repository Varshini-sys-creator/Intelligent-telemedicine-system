package com.telemed.controller;

import com.telemed.entity.User;
import com.telemed.exception.ApiException;
import com.telemed.repository.ConsultationRepository;
import com.telemed.repository.DoctorRepository;
import com.telemed.repository.PatientRepository;
import com.telemed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Basic admin endpoints for demonstration.
 * Admins can view user lists and system statistics.
 * No sensitive medical record access is exposed here.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private ConsultationRepository consultationRepository;

    // GET /api/admin/stats — dashboard statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = Map.of(
                "totalUsers", userRepository.count(),
                "totalPatients", patientRepository.count(),
                "totalDoctors", doctorRepository.count(),
                "totalConsultations", consultationRepository.count()
        );
        return ResponseEntity.ok(stats);
    }

    // GET /api/admin/users — list all users (no passwords exposed)
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // DELETE /api/admin/users/{id}
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw new ApiException("User not found", HttpStatus.NOT_FOUND);
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
}
