package com.petmily.backend.api.notification.dto;

import com.petmily.backend.domain.walk.entity.NotificationSetting;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingsResponse {

    private Long userId;

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

    public static NotificationSettingsResponse from(NotificationSetting setting) {
        return NotificationSettingsResponse.builder()
                .userId(setting.getUserId())
                .departureAlertEnabled(setting.getDepartureAlertEnabled())
                .departureDistanceThreshold(setting.getDepartureDistanceThreshold())
                .delayAlertEnabled(setting.getDelayAlertEnabled())
                .delayTimeThreshold(setting.getDelayTimeThreshold())
                .walkStartNotification(setting.getWalkStartNotification())
                .walkCompleteNotification(setting.getWalkCompleteNotification())
                .emergencyNotification(setting.getEmergencyNotification())
                .smsEnabled(setting.getSmsEnabled())
                .pushEnabled(setting.getPushEnabled())
                .emailEnabled(setting.getEmailEnabled())
                .build();
    }
}