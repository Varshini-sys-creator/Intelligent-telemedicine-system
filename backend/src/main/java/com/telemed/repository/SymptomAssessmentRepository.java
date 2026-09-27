package com.telemed.repository;

import com.telemed.entity.SymptomAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SymptomAssessmentRepository extends JpaRepository<SymptomAssessment, Long> {
    List<SymptomAssessment> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
