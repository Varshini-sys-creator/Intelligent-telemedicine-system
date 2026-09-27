package com.telemed.controller;

import com.telemed.dto.ConsultationRequestDTO;
import com.telemed.dto.ConsultationStatusUpdateDTO;
import com.telemed.entity.Consultation;
import com.telemed.service.ConsultationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    @Autowired
    private ConsultationService consultationService;

    // POST /api/consultations — patient requests a consultation
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Consultation> requestConsultation(Authentication auth,
                                                            @Valid @RequestBody ConsultationRequestDTO dto) {
        Consultation consultation = consultationService.requestConsultation(auth.getName(), dto);
        return ResponseEntity.ok(consultation);
    }

    // GET /api/consultations — returns consultations for the logged-in user based on role
    @GetMapping
    public ResponseEntity<List<Consultation>> getMyConsultations(Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        List<Consultation> consultations;

        if (role.equals("ROLE_PATIENT")) {
            consultations = consultationService.getConsultationsForPatient(auth.getName());
        } else if (role.equals("ROLE_DOCTOR")) {
            consultations = consultationService.getConsultationsForDoctor(auth.getName());
        } else {
            return ResponseEntity.ok(List.of());
        }

        return ResponseEntity.ok(consultations);
    }

    // GET /api/consultations/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Consultation> getConsultationById(@PathVariable Long id) {
        return ResponseEntity.ok(consultationService.getConsultationById(id));
    }

    // PUT /api/consultations/{id}/status — doctor accepts/rejects, patient cancels, etc.
    @PutMapping("/{id}/status")
    public ResponseEntity<Consultation> updateStatus(@PathVariable Long id,
                                                     Authentication auth,
                                                     @Valid @RequestBody ConsultationStatusUpdateDTO dto) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        Consultation updated = consultationService.updateStatus(id, auth.getName(), role, dto);
        return ResponseEntity.ok(updated);
    }
}
