package com.telemed.controller;

import com.telemed.dto.DoctorProfileDTO;
import com.telemed.entity.Doctor;
import com.telemed.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    // GET /api/doctors — any authenticated user can browse available doctors
    @GetMapping
    public ResponseEntity<List<Doctor>> getAvailableDoctors(
            @RequestParam(required = false) String specialization) {
        List<Doctor> doctors = specialization != null
                ? doctorService.searchBySpecialization(specialization)
                : doctorService.getAllAvailableDoctors();
        return ResponseEntity.ok(doctors);
    }

    // GET /api/doctors/{id} — look up a specific doctor by ID
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    // GET /api/doctors/profile — the logged-in doctor sees their own profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Doctor> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(doctorService.getDoctorByEmail(auth.getName()));
    }

    // PUT /api/doctors/profile — the logged-in doctor updates their profile
    @PutMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Doctor> updateMyProfile(Authentication auth, @RequestBody DoctorProfileDTO dto) {
        return ResponseEntity.ok(doctorService.updateProfile(auth.getName(), dto));
    }
}
