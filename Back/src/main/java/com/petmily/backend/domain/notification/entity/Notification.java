package com.petmily.backend.domain.notification.entity;

import com.petmily.backend.domain.notification.enums.NotificationType;
import com.petmily.backend.domain.notification.enums.NotificationStatus;
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
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String title;
    
    @Column(nullable = false, length = 500)
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "priority", nullable = false)
    private Integer priority;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column(name = "action_url")
    private String actionUrl;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Builder
    public Notification(String title, String content, NotificationType type, 
                      NotificationStatus status, Boolean isActive, 
                      LocalDateTime startDate, LocalDateTime endDate, 
                      Integer priority, String imageUrl, String actionUrl) {
        this.title = title;
        this.content = content;
        this.type = type;
        this.status = status;
        this.isActive = isActive;
        this.startDate = startDate;
        this.endDate = endDate;
        this.priority = priority;
        this.imageUrl = imageUrl;
        this.actionUrl = actionUrl;
    }
    
    public void updateStatus(NotificationStatus status) {
        this.status = status;
    }
    
    public void updateActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
