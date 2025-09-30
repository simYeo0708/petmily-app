package com.petmily.backend.domain.walk.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "emergency_contacts")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class EmergencyContact extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "contact_name", nullable = false, length = 50)
    private String contactName;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "relationship", length = 30)
    private String relationship; // 가족, 친구, 기타

    @Builder.Default
    @Column(name = "is_primary")
    private Boolean isPrimary = false; // 주 연락처 여부

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}