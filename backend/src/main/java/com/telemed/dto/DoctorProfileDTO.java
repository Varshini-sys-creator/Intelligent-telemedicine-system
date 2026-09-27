package com.telemed.dto;

import lombok.Data;

@Data
public class DoctorProfileDTO {
    private String fullName;
    private String phone;
    private String specialization;
    private String qualification;
    private String hospitalAffiliation;
    private Boolean isAvailable;
}
