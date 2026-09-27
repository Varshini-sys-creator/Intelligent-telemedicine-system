package com.telemed.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Integer age;
    private String gender;
    private String bloodGroup;
    private String villageCommunity;
    private String district;
    private String emergencyContact;

    @Column(columnDefinition = "TEXT")
    private String medicalHistorySummary;
}
