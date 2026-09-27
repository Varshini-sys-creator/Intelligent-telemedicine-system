package com.telemed.controller;

import com.telemed.entity.CommunityHealthWorker;
import com.telemed.entity.Patient;
import com.telemed.service.ChwService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chw")
public class ChwController {

    @Autowired
    private ChwService chwService;

    // GET /api/chw/profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('CHW')")
    public ResponseEntity<CommunityHealthWorker> getProfile(Authentication auth) {
        return ResponseEntity.ok(chwService.getChwProfile(auth.getName()));
    }

    // GET /api/chw/patients — patients in the CHW's assigned district
    @GetMapping("/patients")
    @PreAuthorize("hasRole('CHW')")
    public ResponseEntity<List<Patient>> getPatientsInRegion(Authentication auth) {
        return ResponseEntity.ok(chwService.getPatientsInRegion(auth.getName()));
    }
}
