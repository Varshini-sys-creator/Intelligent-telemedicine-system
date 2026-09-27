package com.telemed.dto;

import lombok.Data;

@Data
public class SymptomAnalysisRequestDTO {
    private String symptoms;
    private Integer durationDays;
    private Integer age;
    private String additionalInfo;
}
