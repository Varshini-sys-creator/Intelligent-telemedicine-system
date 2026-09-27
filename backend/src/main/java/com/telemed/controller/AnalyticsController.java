package com.telemed.controller;

import com.telemed.entity.Consultation;
import com.telemed.entity.Patient;
import com.telemed.entity.SymptomAssessment;
import com.telemed.repository.ConsultationRepository;
import com.telemed.repository.PatientRepository;
import com.telemed.repository.SymptomAssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

/**
 * Controller providing demonstration analytics for disease and symptom trends.
 * Supports public health monitoring for rural clusters and community health workers.
 *
 * NOTE: For college project demonstration. Clearly marked as analytical/trend observation,
 * not clinical outbreak prediction.
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private SymptomAssessmentRepository symptomRepository;

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping("/outbreak-summary")
    @PreAuthorize("hasAnyRole('CHW', 'DOCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getOutbreakSummary() {
        Map<String, Object> result = new LinkedHashMap<>();

        List<SymptomAssessment> assessments = symptomRepository.findAll();
        List<Patient> patients = patientRepository.findAll();

        // 1. Symptom category breakdown
        Map<String, Integer> symptomCounts = new LinkedHashMap<>();
        symptomCounts.put("Fever / Chills", 0);
        symptomCounts.put("Respiratory (Cough/Cold)", 0);
        symptomCounts.put("Gastrointestinal", 0);
        symptomCounts.put("Headache / Bodyache", 0);
        symptomCounts.put("Other", 0);

        for (SymptomAssessment sa : assessments) {
            String sym = sa.getRawSymptoms().toLowerCase();
            boolean categorized = false;
            if (sym.contains("fever") || sym.contains("temp") || sym.contains("chill")) {
                symptomCounts.put("Fever / Chills", symptomCounts.get("Fever / Chills") + 1);
                categorized = true;
            }
            if (sym.contains("cough") || sym.contains("cold") || sym.contains("breath") || sym.contains("throat")) {
                symptomCounts.put("Respiratory (Cough/Cold)", symptomCounts.get("Respiratory (Cough/Cold)") + 1);
                categorized = true;
            }
            if (sym.contains("vomit") || sym.contains("diarrhea") || sym.contains("stomach") || sym.contains("loose")) {
                symptomCounts.put("Gastrointestinal", symptomCounts.get("Gastrointestinal") + 1);
                categorized = true;
            }
            if (sym.contains("headache") || sym.contains("body") || sym.contains("joint") || sym.contains("ache")) {
                symptomCounts.put("Headache / Bodyache", symptomCounts.get("Headache / Bodyache") + 1);
                categorized = true;
            }
            if (!categorized) {
                symptomCounts.put("Other", symptomCounts.get("Other") + 1);
            }
        }

        // 2. Region / District Distribution
        Map<String, Integer> districtCounts = new HashMap<>();
        for (Patient p : patients) {
            String district = p.getDistrict() != null ? p.getDistrict() : "Unknown";
            districtCounts.put(district, districtCounts.getOrDefault(district, 0) + 1);
        }

        // 3. Early Warning Indicators (Demonstration rule)
        List<Map<String, String>> alerts = new ArrayList<>();
        int feverCount = symptomCounts.getOrDefault("Fever / Chills", 0);
        if (feverCount >= 2) {
            alerts.add(Map.of(
                    "level", "MODERATE_ALERT",
                    "region", "Valparai / Coimbatore Cluster",
                    "message", "Elevated fever incidence reported in the past 7 days. Recommended action: Intensify CHW household visits and water quality checks."
            ));
        }

        result.put("totalAssessments", assessments.size());
        result.put("symptomTrends", symptomCounts);
        result.put("regionDistribution", districtCounts);
        result.put("earlyWarningAlerts", alerts);
        result.put("disclaimer", "Demonstration analytics based on collected symptoms and consultations. Not an epidemiological diagnosis.");

        return ResponseEntity.ok(result);
    }
}
