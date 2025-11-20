package com.petmily.backend.domain.notification.repository;

import com.petmily.backend.domain.notification.entity.Notification;
import com.petmily.backend.domain.notification.enums.NotificationStatus;
import com.petmily.backend.domain.notification.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByTypeAndStatusAndIsActiveTrueOrderByPriorityDescCreatedAtDesc(
        NotificationType type, NotificationStatus status);
    
    @Query("SELECT n FROM Notification n WHERE n.type = :type AND n.status = :status " +
           "AND n.isActive = true AND (n.startDate IS NULL OR n.startDate <= :now) " +
           "AND (n.endDate IS NULL OR n.endDate >= :now) " +
           "ORDER BY n.priority DESC, n.createdAt DESC")
    List<Notification> findActiveNotificationsByTypeAndStatus(
        @Param("type") NotificationType type, 
        @Param("status") NotificationStatus status, 
        @Param("now") LocalDateTime now);
    
    Optional<Notification> findByIdAndStatusAndIsActiveTrue(Long id, NotificationStatus status);
    
    List<Notification> findByStatusAndIsActiveTrueOrderByPriorityDescCreatedAtDesc(NotificationStatus status);
}

