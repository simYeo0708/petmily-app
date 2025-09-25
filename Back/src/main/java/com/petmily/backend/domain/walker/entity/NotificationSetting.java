package com.petmily.backend.domain.walker.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
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

    // 이탈 알림 설정
    @Builder.Default
    @Column(name = "departure_alert_enabled")
    private Boolean departureAlertEnabled = true;

    @Builder.Default
    @Column(name = "departure_distance_threshold") // 미터 단위
    private Integer departureDistanceThreshold = 200;

    // 지연 알림 설정
    @Builder.Default
    @Column(name = "delay_alert_enabled")
    private Boolean delayAlertEnabled = true;

    @Builder.Default
    @Column(name = "delay_time_threshold") // 분 단위
    private Integer delayTimeThreshold = 10;

    // 일반 알림 설정
    @Builder.Default
    @Column(name = "walk_start_notification")
    private Boolean walkStartNotification = true;

    @Builder.Default
    @Column(name = "walk_complete_notification")
    private Boolean walkCompleteNotification = true;

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