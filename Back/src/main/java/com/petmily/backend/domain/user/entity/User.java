package com.petmily.backend.domain.user.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.walker.entity.Walker;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;

    @Column(unique = true)
    private String email;

    private String profile;
    private String name;
    private String phone;

    @Column
    private String provider; // OAuth2 provider (e.g., google, kakao, naver)

    @Column
    private String providerId; // OAuth2 provider's unique ID for the user

    @Embedded
    private Address address;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "fcm_token", length = 500)
    private String fcmToken;

    // Emergency contact information
    @Column(name = "emergency_contact_name", length = 50)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relationship", length = 30)
    private String emergencyContactRelationship; // family, friend, etc

    // ===========================================
    // Relationships
    // ===========================================

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private NotificationSetting notificationSetting;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Pet> pets = new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Walker walker;

}