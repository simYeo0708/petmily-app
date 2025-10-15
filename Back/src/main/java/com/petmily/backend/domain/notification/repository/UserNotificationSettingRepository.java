package com.petmily.backend.domain.notification.repository;

import com.petmily.backend.domain.notification.entity.UserNotificationSetting;
import com.petmily.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserNotificationSettingRepository extends JpaRepository<UserNotificationSetting, Long> {
    
    @Query("SELECT uns FROM UserNotificationSetting uns WHERE uns.user = :user AND uns.notification.id = :notificationId")
    Optional<UserNotificationSetting> findByUserAndNotification(@Param("user") User user, @Param("notificationId") Long notificationId);
    
    @Query("SELECT uns FROM UserNotificationSetting uns WHERE uns.user = :user AND uns.notification.id = :notificationId")
    Optional<UserNotificationSetting> findByUserAndNotificationId(@Param("user") User user, @Param("notificationId") Long notificationId);
    
    @Query("SELECT uns FROM UserNotificationSetting uns WHERE uns.user = :user AND " +
           "(uns.expiresAt IS NULL OR uns.expiresAt > :now)")
    List<UserNotificationSetting> findActiveDismissalsByUser(@Param("user") User user, @Param("now") LocalDateTime now);
    
    @Query("SELECT uns.notification.id FROM UserNotificationSetting uns WHERE uns.user = :user AND " +
           "(uns.expiresAt IS NULL OR uns.expiresAt > :now)")
    List<Long> findDismissedNotificationIdsByUser(@Param("user") User user, @Param("now") LocalDateTime now);
    
    boolean existsByUserAndNotificationIdAndExpiresAtAfter(User user, Long notificationId, LocalDateTime now);
    
    @Query("DELETE FROM UserNotificationSetting uns WHERE uns.user = :user AND uns.notification.id = :notificationId")
    void deleteByUserAndNotification(@Param("user") User user, @Param("notificationId") Long notificationId);
}
