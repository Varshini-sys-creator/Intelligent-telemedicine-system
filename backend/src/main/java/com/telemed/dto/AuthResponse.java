package com.telemed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Returned to the frontend after successful login or registration.
 * The token is stored in localStorage on the client side.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String fullName;
    private String role;
    private String languagePreference;

    public AuthResponse(String token, Long userId, String email, String fullName, String role, String languagePreference) {
        this.token = token;
        this.tokenType = "Bearer";
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.languagePreference = languagePreference;
    }
}
