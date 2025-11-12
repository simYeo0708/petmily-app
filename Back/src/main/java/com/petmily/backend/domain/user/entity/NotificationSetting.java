package com.petmily.backend.domain.user.entity;

import com.petmily.backend.domain.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_settings")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class NotificationSetting extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    // Relations
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

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
    @Column(name = "departure_distance_threshold") // 미터 단위
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
    @Column(name = "delay_time_threshold") // 분 단위
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

    // 연락 방법 설정
    @Builder.Default
    @Column(name = "sms_enabled")
    private Boolean smsEnabled = true;

    @Builder.Default
    @Column(name = "push_enabled")
    private Boolean pushEnabled = true;

    @Builder.Default
    @Column(name = "email_enabled")
    private Boolean emailEnabled = false;
}