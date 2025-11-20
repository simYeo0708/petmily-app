package com.petmily.backend.api.notification.service;

import com.petmily.backend.api.notification.dto.DismissNotificationRequest;
import com.petmily.backend.api.notification.dto.NotificationResponse;
import com.petmily.backend.domain.mall.order.entity.Order;
import com.petmily.backend.domain.mall.order.entity.OrderStatus;
import com.petmily.backend.domain.mall.subscription.entity.Subscription;
import com.petmily.backend.domain.notification.entity.Notification;
import com.petmily.backend.domain.notification.entity.UserNotificationSetting;
import com.petmily.backend.domain.notification.enums.NotificationDismissType;
import com.petmily.backend.domain.notification.enums.NotificationStatus;
import com.petmily.backend.domain.notification.enums.NotificationType;
import com.petmily.backend.domain.notification.repository.NotificationRepository;
import com.petmily.backend.domain.notification.repository.UserNotificationSettingRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserNotificationSettingRepository userNotificationSettingRepository;
    private final UserRepository userRepository;
    
    /**
     * 사용자에게 표시할 알림 목록 조회
     */
    public List<NotificationResponse> getActiveNotificationsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        LocalDateTime now = LocalDateTime.now();
        
        // 사용자가 숨긴 알림 ID 목록 조회
        List<Long> dismissedNotificationIds = userNotificationSettingRepository
                .findDismissedNotificationIdsByUser(user, now);
        
        // 활성화된 알림 중 사용자가 숨기지 않은 것들만 조회
        List<Notification> activeNotifications = notificationRepository
                .findActiveNotificationsByTypeAndStatus(NotificationType.WALKER_RECRUITMENT, 
                                                       NotificationStatus.PUBLISHED, now);
        
        return activeNotifications.stream()
                .filter(notification -> !dismissedNotificationIds.contains(notification.getId()))
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 알림 숨기기 처리
     */
    @Transactional
    public void dismissNotification(Long userId, DismissNotificationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Notification notification = notificationRepository.findById(request.getNotificationId())
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다."));
        
        // 기존 설정이 있다면 삭제
        userNotificationSettingRepository.deleteByUserAndNotification(user, request.getNotificationId());
        
        // 만료 시간 계산
        LocalDateTime expiresAt = calculateExpiresAt(request.getDismissType());
        
        // 새로운 설정 생성
        UserNotificationSetting setting = UserNotificationSetting.builder()
                .user(user)
                .notification(notification)
                .dismissType(request.getDismissType())
                .dismissedAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build();
        
        userNotificationSettingRepository.save(setting);
        
        log.info("사용자 {}가 알림 {}을 {}로 설정했습니다.", userId, request.getNotificationId(), request.getDismissType());
    }
    
    /**
     * 알림 숨기기 취소
     */
    @Transactional
    public void cancelDismissNotification(Long userId, Long notificationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        userNotificationSettingRepository.deleteByUserAndNotification(user, notificationId);
        
        log.info("사용자 {}가 알림 {}의 숨기기 설정을 취소했습니다.", userId, notificationId);
    }
    
    /**
     * 만료된 숨기기 설정 정리
     */
    @Transactional
    public void cleanupExpiredDismissals() {
        LocalDateTime now = LocalDateTime.now();
        List<UserNotificationSetting> expiredSettings = userNotificationSettingRepository
                .findActiveDismissalsByUser(null, now).stream()
                .filter(UserNotificationSetting::isExpired)
                .collect(Collectors.toList());
        
        userNotificationSettingRepository.deleteAll(expiredSettings);
        
        log.info("만료된 알림 숨기기 설정 {}개를 정리했습니다.", expiredSettings.size());
    }
    
    /**
     * Mall 모듈 연동: 주문 생성 알림 (현재는 로그만 남김)
     */
    public void sendOrderCreatedNotification(Order order) {
        log.info("[Notification] 주문 생성 알림 - 사용자:{}, 주문번호:{}, 상품수:{}",
                order.getUser().getId(), order.getOrderNumber(), order.getOrderItems().size());
    }
    
    /**
     * Mall 모듈 연동: 주문 상태 변경 알림 (현재는 로그만 남김)
     */
    public void sendOrderStatusNotification(Order order, OrderStatus newStatus) {
        log.info("[Notification] 주문 상태 변경 - 사용자:{}, 주문번호:{}, 상태:{}",
                order.getUser().getId(), order.getOrderNumber(), newStatus);
    }
    
    /**
     * Mall 모듈 연동: 정기배송 일시정지 알림 (현재는 로그만 남김)
     */
    public void sendSubscriptionPausedNotification(Subscription subscription, String reason) {
        log.info("[Notification] 정기배송 일시정지 - 사용자:{}, 상품:{}, 사유:{}",
                subscription.getUser().getId(), subscription.getProduct().getId(), reason);
    }
    
    /**
     * Mall 모듈 연동: 정기배송 주문 생성 알림 (현재는 로그만 남김)
     */
    public void sendSubscriptionOrderCreatedNotification(Order order, Subscription subscription) {
        log.info("[Notification] 정기배송 주문 생성 - 사용자:{}, 주문번호:{}, 구독ID:{}",
                subscription.getUser().getId(), order.getOrderNumber(), subscription.getId());
    }
    
    /**
     * 숨기기 유형에 따른 만료 시간 계산
     */
    private LocalDateTime calculateExpiresAt(NotificationDismissType dismissType) {
        LocalDateTime now = LocalDateTime.now();
        
        switch (dismissType) {
            case NEVER:
                return null; // 영구적으로 숨김
            case WEEK:
                return now.plusWeeks(1);
            case SESSION:
                return now.plusHours(1); // 세션 동안만 숨김 (1시간)
            default:
                return now.plusWeeks(1); // 기본값: 일주일
        }
    }
}
