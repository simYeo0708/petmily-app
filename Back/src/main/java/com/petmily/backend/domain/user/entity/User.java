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

    @Column
    private String provider; // OAuth2 provider (e.g., google, kakao, naver)

    @Column
    private String providerId; // OAuth2 provider's unique ID for the user

    @Embedded
    private Address address;

    @Enumerated(EnumType.STRING)
    private Role role;

    // 비상연락망 정보
    @Column(name = "emergency_contact_name", length = 50)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relationship", length = 30)
    private String emergencyContactRelationship; // 가족, 친구, 기타

    // ===========================================
    // 알림 설정 관련 필드들
    // ===========================================

    /**
     * 워커 출발 알림 활성화 여부
     * 워커가 사용자 위치로부터 특정 거리에 접근했을 때 알림을 받을지 설정
     */
    @Builder.Default
    @Column(name = "departure_alert_enabled")
    private Boolean departureAlertEnabled = true;

    /**
     * 출발 알림 거리 임계값 (미터 단위)
     * 워커가 이 거리 내에 접근하면 알림이 발송됨
     * 기본값: 200미터
     */
    @Builder.Default
    @Column(name = "departure_distance_threshold")
    private Integer departureDistanceThreshold = 200;

    /**
     * 지연 알림 활성화 여부
     * 예약된 산책 시간보다 늦어질 때 알림을 받을지 설정
     */
    @Builder.Default
    @Column(name = "delay_alert_enabled")
    private Boolean delayAlertEnabled = true;

    /**
     * 지연 알림 시간 임계값 (분 단위)
     * 예약 시간보다 이 시간만큼 지연되면 알림이 발송됨
     * 기본값: 10분
     */
    @Builder.Default
    @Column(name = "delay_time_threshold")
    private Integer delayTimeThreshold = 10;

    /**
     * 산책 시작 알림 활성화 여부
     * 워커가 실제로 산책을 시작했을 때 알림을 받을지 설정
     */
    @Builder.Default
    @Column(name = "walk_start_notification")
    private Boolean walkStartNotification = true;

    /**
     * 산책 완료 알림 활성화 여부
     * 산책이 완료되고 사진/리포트가 업로드되었을 때 알림을 받을지 설정
     */
    @Builder.Default
    @Column(name = "walk_complete_notification")
    private Boolean walkCompleteNotification = true;

    /**
     * 응급상황 알림 활성화 여부
     * 산책 중 응급상황 발생 시 즉시 알림을 받을지 설정
     * 보안상 중요하므로 기본값은 항상 true로 설정
     */
    @Builder.Default
    @Column(name = "emergency_notification")
    private Boolean emergencyNotification = true;

    public User update(String name, String profile) {
        this.name = name;
        this.profile = profile;
        return this;
    }

    public String getProfileImageUrl() {
        return this.profile;
    }

    // Relations
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Pet> pets = new ArrayList<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private WalkerProfile walkerProfile;
    
}
