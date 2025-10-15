package com.petmily.backend.domain.notification.entity;

import com.petmily.backend.domain.notification.enums.NotificationDismissType;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_notification_settings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class UserNotificationSetting {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationDismissType dismissType;
    
    @Column(name = "dismissed_at", nullable = false)
    private LocalDateTime dismissedAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Builder
    public UserNotificationSetting(User user, Notification notification, 
                                 NotificationDismissType dismissType, 
                                 LocalDateTime dismissedAt, LocalDateTime expiresAt) {
        this.user = user;
        this.notification = notification;
        this.dismissType = dismissType;
        this.dismissedAt = dismissedAt;
        this.expiresAt = expiresAt;
    }
    
    public boolean isExpired() {
        if (expiresAt == null) {
            return false; // 영구적으로 숨김
        }
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    public void updateExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
