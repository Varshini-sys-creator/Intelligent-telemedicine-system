package com.telemed.dto;

import lombok.Data;

import java.util.List;

@Data
public class MedicalRecordDTO {
    private Long patientId;
    private Long consultationId;
    private String clinicalNotes;
    private String diagnosisSummary;
    private String followUpRecommendation;
    private List<PrescriptionDTO> prescriptions;
}
