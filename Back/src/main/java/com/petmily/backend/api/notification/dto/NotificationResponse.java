package com.petmily.backend.api.notification.dto;

import com.petmily.backend.domain.notification.entity.Notification;
import com.petmily.backend.domain.notification.enums.NotificationType;
import com.petmily.backend.domain.notification.enums.NotificationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String content;
    private NotificationType type;
    private NotificationStatus status;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer priority;
    private String imageUrl;
    private String actionUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static NotificationResponse from(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType())
                .status(notification.getStatus())
                .isActive(notification.getIsActive())
                .startDate(notification.getStartDate())
                .endDate(notification.getEndDate())
                .priority(notification.getPriority())
                .imageUrl(notification.getImageUrl())
                .actionUrl(notification.getActionUrl())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}

