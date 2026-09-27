package com.telemed.controller;

import com.telemed.dto.MedicalRecordDTO;
import com.telemed.entity.MedicalRecord;
import com.telemed.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    // GET /api/medical-records/my — patient views their own medical history
    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<MedicalRecord>> getMyRecords(Authentication auth) {
        return ResponseEntity.ok(medicalRecordService.getRecordsForPatient(auth.getName()));
    }

    // GET /api/medical-records/{id}
    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecord> getRecordById(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(medicalRecordService.getRecordById(id, auth.getName()));
    }

    // POST /api/medical-records — doctor adds a medical record after consultation
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalRecord> createRecord(Authentication auth, @RequestBody MedicalRecordDTO dto) {
        return ResponseEntity.ok(medicalRecordService.createRecord(auth.getName(), dto));
    }
}
