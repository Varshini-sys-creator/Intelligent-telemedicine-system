package com.telemed.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConsultationRequestDTO {
    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private String symptomSummary;
    private String consultationType = "VIDEO";
    private String scheduledTime; // ISO 8601 string, e.g. "2026-09-22T10:00:00"
}
