package com.telemed.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConsultationStatusUpdateDTO {
    @NotBlank(message = "Status is required")
    private String status; // ACCEPTED, REJECTED, ONGOING, COMPLETED, CANCELLED
    private String meetingLink; // Optional: doctor can update the meeting room link
}
