package com.telemed.repository;

import com.telemed.entity.Consultation;
import com.telemed.entity.ConsultationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByPatientIdOrderByRequestedDateDesc(Long patientId);
    List<Consultation> findByDoctorIdOrderByRequestedDateDesc(Long doctorId);
    List<Consultation> findByDoctorIdAndStatus(Long doctorId, ConsultationStatus status);
}
