package com.telemed.dto;

import lombok.Data;

@Data
public class PrescriptionDTO {
    private String medicineName;
    private String dosage;
    private String frequency;
    private Integer durationDays;
    private String specialInstructions;
}
