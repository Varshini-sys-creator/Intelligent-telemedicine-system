package com.telemed.dto;

import lombok.Data;

@Data
public class PatientProfileDTO {
    // User fields
    private String fullName;
    private String phone;
    private String languagePreference;

    // Patient-specific fields
    private Integer age;
    private String gender;
    private String bloodGroup;
    private String villageCommunity;
    private String district;
    private String emergencyContact;
    private String medicalHistorySummary;
}
