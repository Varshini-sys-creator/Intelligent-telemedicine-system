package com.telemed.repository;

import com.telemed.entity.EmergencyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Long> {
    List<EmergencyRequest> findByStatusOrderByTriggeredAtDesc(String status);
    List<EmergencyRequest> findByPatientIdOrderByTriggeredAtDesc(Long patientId);
}
