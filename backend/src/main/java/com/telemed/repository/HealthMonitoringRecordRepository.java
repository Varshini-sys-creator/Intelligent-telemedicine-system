package com.telemed.repository;

import com.telemed.entity.HealthMonitoringRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthMonitoringRecordRepository extends JpaRepository<HealthMonitoringRecord, Long> {
    List<HealthMonitoringRecord> findByPatientIdOrderByRecordedAtDesc(Long patientId);
    Optional<HealthMonitoringRecord> findFirstByPatientIdOrderByRecordedAtDesc(Long patientId);
}
