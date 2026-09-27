package com.telemed.controller;

import com.telemed.dto.PatientProfileDTO;
import com.telemed.entity.Patient;
import com.telemed.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    // GET /api/patients/profile — the logged-in patient views their own profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Patient> getMyProfile(Authentication auth) {
        Patient patient = patientService.getPatientByEmail(auth.getName());
        return ResponseEntity.ok(patient);
    }

    // PUT /api/patients/profile — the logged-in patient updates their own profile
    @PutMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Patient> updateMyProfile(Authentication auth, @RequestBody PatientProfileDTO dto) {
        Patient updated = patientService.updateProfile(auth.getName(), dto);
        return ResponseEntity.ok(updated);
    }

    // GET /api/patients/{id} — doctors and CHWs can look up a specific patient
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'CHW', 'ADMIN')")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }
}
