package com.telemed.controller;

import com.telemed.entity.EmergencyRequest;
import com.telemed.service.EmergencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency")
public class EmergencyController {

    @Autowired
    private EmergencyService emergencyService;

    // POST /api/emergency/sos — patient triggers emergency SOS
    @PostMapping("/sos")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<EmergencyRequest> triggerSOS(Authentication auth,
                                                        @RequestBody Map<String, Object> body) {
        Double latitude = body.get("latitude") != null ? Double.parseDouble(body.get("latitude").toString()) : null;
        Double longitude = body.get("longitude") != null ? Double.parseDouble(body.get("longitude").toString()) : null;
        String locationAddress = (String) body.get("locationAddress");
        String emergencyType = (String) body.get("emergencyType");

        EmergencyRequest request = emergencyService.triggerSOS(
                auth.getName(), latitude, longitude, locationAddress, emergencyType
        );
        return ResponseEntity.ok(request);
    }

    // GET /api/emergency/active — CHW and admin can see active emergencies
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('CHW', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<List<EmergencyRequest>> getActiveEmergencies() {
        return ResponseEntity.ok(emergencyService.getActiveEmergencies());
    }

    // GET /api/emergency/my — patient views their own SOS history
    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<EmergencyRequest>> getMyEmergencies(Authentication auth) {
        return ResponseEntity.ok(emergencyService.getPatientEmergencies(auth.getName()));
    }

    // PUT /api/emergency/{id}/resolve — CHW or admin resolves an emergency
    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('CHW', 'ADMIN')")
    public ResponseEntity<EmergencyRequest> resolveEmergency(@PathVariable Long id) {
        return ResponseEntity.ok(emergencyService.resolveEmergency(id));
    }
}
