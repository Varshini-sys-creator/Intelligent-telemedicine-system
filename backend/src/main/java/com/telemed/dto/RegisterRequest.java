package com.telemed.dto;

import com.telemed.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    private String phone;
    private String languagePreference = "en";

    // Patient specific fields
    private Integer age;
    private String gender;
    private String bloodGroup;
    private String villageCommunity;
    private String district;
    private String emergencyContact;

    // Doctor specific fields
    private String specialization;
    private String qualification;
    private String licenseNumber;
    private String hospitalAffiliation;

    // CHW specific fields
    private String assignedRegion;
    private String assignedDistrict;
    private String centerName;
}
