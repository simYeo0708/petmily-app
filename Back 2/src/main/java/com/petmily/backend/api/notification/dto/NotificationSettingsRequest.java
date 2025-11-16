package com.petmily.backend.api.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingsRequest {

    // 이탈 알림 설정
    private Boolean departureAlertEnabled;
    private Integer departureDistanceThreshold; // 미터 단위

    // 지연 알림 설정
    private Boolean delayAlertEnabled;
    private Integer delayTimeThreshold; // 분 단위

    // 일반 알림 설정
    private Boolean walkStartNotification;
    private Boolean walkCompleteNotification;
    private Boolean emergencyNotification;

    // 연락 방법 설정
    private Boolean smsEnabled;
    private Boolean pushEnabled;
    private Boolean emailEnabled;
}