package com.petmily.backend.domain.user.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.order.entity.Order;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
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

    // 비상연락망 정보
    @Column(name = "emergency_contact_name", length = 50)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relationship", length = 30)
    private String emergencyContactRelationship; // 가족, 친구, 기타

    // 알림 설정
    @Builder.Default
    @Column(name = "departure_alert_enabled")
    private Boolean departureAlertEnabled = true;

    @Builder.Default
    @Column(name = "departure_distance_threshold") // 미터 단위
    private Integer departureDistanceThreshold = 200;

    @Builder.Default
    @Column(name = "delay_alert_enabled")
    private Boolean delayAlertEnabled = true;

    @Builder.Default
    @Column(name = "delay_time_threshold") // 분 단위
    private Integer delayTimeThreshold = 10;

    @Builder.Default
    @Column(name = "walk_start_notification")
    private Boolean walkStartNotification = true;

    @Builder.Default
    @Column(name = "walk_complete_notification")
    private Boolean walkCompleteNotification = true;

    @Builder.Default
    @Column(name = "emergency_notification")
    private Boolean emergencyNotification = true;

    @Column
    private String provider; // OAuth2 provider (e.g., google, kakao, naver)

    @Column
    private String providerId; // OAuth2 provider's unique ID for the user

    @Embedded
    private Address address;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "last_login_time")
    private LocalDateTime lastLoginTime;

    public User update(String name, String profile) {
        this.name = name;
        this.profile = profile;
        return this;
    }

    public void updateLastLoginTime() {
        this.lastLoginTime = LocalDateTime.now();
    }
    
    public String getProfileImageUrl() {
        return this.profile;
    }

    // 비상연락망 헬퍼 메소드
    public boolean hasEmergencyContact() {
        return emergencyContactPhone != null && !emergencyContactPhone.trim().isEmpty();
    }

    public String getEmergencyContactDisplay() {
        if (!hasEmergencyContact()) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        if (emergencyContactName != null && !emergencyContactName.trim().isEmpty()) {
            sb.append(emergencyContactName);
            if (emergencyContactRelationship != null && !emergencyContactRelationship.trim().isEmpty()) {
                sb.append(" (").append(emergencyContactRelationship).append(")");
            }
            sb.append(" - ");
        }
        sb.append(emergencyContactPhone);
        return sb.toString();
    }



    // Relations
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Pet> pets = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private WalkerProfile walkerProfile;
    
}
