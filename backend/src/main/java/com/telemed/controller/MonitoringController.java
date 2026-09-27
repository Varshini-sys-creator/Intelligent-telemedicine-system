package com.telemed.controller;

import com.telemed.entity.HealthMonitoringRecord;
import com.telemed.service.MonitoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monitoring")
public class MonitoringController {

    @Autowired
    private MonitoringService monitoringService;

    // GET /api/monitoring/my — patient views their own vitals history
    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<HealthMonitoringRecord>> getMyReadings(Authentication auth) {
        return ResponseEntity.ok(monitoringService.getRecordsForPatient(auth.getName()));
    }

    // GET /api/monitoring/my/latest — latest single reading for dashboard widget
    @GetMapping("/my/latest")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<HealthMonitoringRecord> getLatestReading(Authentication auth) {
        HealthMonitoringRecord latest = monitoringService.getLatestForPatient(auth.getName());
        if (latest == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(latest);
    }

    // POST /api/monitoring — patient or CHW submits a new reading
    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'CHW')")
    public ResponseEntity<HealthMonitoringRecord> addReading(Authentication auth,
                                                              @RequestBody HealthMonitoringRecord reading) {
        return ResponseEntity.ok(monitoringService.addReading(auth.getName(), reading));
    }
}
