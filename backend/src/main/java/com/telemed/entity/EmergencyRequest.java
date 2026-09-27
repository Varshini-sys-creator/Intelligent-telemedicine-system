package com.telemed.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private Double latitude;
    private Double longitude;
    private String locationAddress;
    private String emergencyType;
    private String status = "ACTIVE"; // ACTIVE, RESPONDED, RESOLVED

    private LocalDateTime triggeredAt;
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        triggeredAt = LocalDateTime.now();
    }
}
