package com.petmily.backend.api.notification.dto;

import com.petmily.backend.domain.notification.enums.NotificationDismissType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DismissNotificationRequest {
    private Long notificationId;
    private NotificationDismissType dismissType;
    
    public DismissNotificationRequest(Long notificationId, NotificationDismissType dismissType) {
        this.notificationId = notificationId;
        this.dismissType = dismissType;
    }
}

