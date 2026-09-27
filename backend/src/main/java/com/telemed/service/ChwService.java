package com.telemed.service;

import com.telemed.entity.CommunityHealthWorker;
import com.telemed.entity.Patient;
import com.telemed.entity.User;
import com.telemed.exception.ApiException;
import com.telemed.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChwService {

    @Autowired
    private CommunityHealthWorkerRepository chwRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    public CommunityHealthWorker getChwProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return chwRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("CHW profile not found", HttpStatus.NOT_FOUND));
    }

    /**
     * Returns patients in the same district as the CHW.
     * For a student project this is a reasonable simplification —
     * in production you'd have explicit patient-CHW assignments.
     */
    public List<Patient> getPatientsInRegion(String chwEmail) {
        CommunityHealthWorker chw = getChwProfile(chwEmail);
        return patientRepository.findByDistrict(chw.getAssignedDistrict());
    }
}
