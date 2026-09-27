package com.telemed.controller;

import com.telemed.dto.SymptomAnalysisRequestDTO;
import com.telemed.dto.SymptomAnalysisResponseDTO;
import com.telemed.service.SymptomAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/symptoms")
public class SymptomController {

    @Autowired
    private SymptomAnalysisService symptomAnalysisService;

    // POST /api/symptoms/analyze — patient submits symptoms for AI-assisted analysis
    @PostMapping("/analyze")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<SymptomAnalysisResponseDTO> analyzeSymptoms(Authentication auth,
                                                                       @RequestBody SymptomAnalysisRequestDTO request) {
        SymptomAnalysisResponseDTO response = symptomAnalysisService.analyze(auth.getName(), request);
        return ResponseEntity.ok(response);
    }
}
