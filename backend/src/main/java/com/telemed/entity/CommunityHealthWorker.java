package com.telemed.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chw_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityHealthWorker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String assignedRegion;

    @Column(nullable = false)
    private String assignedDistrict;

    private String centerName;
}
