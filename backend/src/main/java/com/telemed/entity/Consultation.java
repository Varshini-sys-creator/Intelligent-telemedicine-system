package com.telemed.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(columnDefinition = "TEXT")
    private String symptomSummary;

    private String consultationType = "VIDEO";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConsultationStatus status = ConsultationStatus.REQUESTED;

    private LocalDateTime requestedDate;
    private LocalDateTime scheduledTime;
    private String meetingLink;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        requestedDate = LocalDateTime.now();
        createdAt = LocalDateTime.now();
        if (meetingLink == null || meetingLink.isBlank()) {
            meetingLink = "telemed-room-" + System.currentTimeMillis();
        }
    }
}
