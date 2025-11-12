package com.petmily.backend.api.notification.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.notification.dto.NotificationSettingsRequest;
import com.petmily.backend.api.notification.dto.NotificationSettingsResponse;
import com.petmily.backend.api.notification.dto.PushNotificationRequest;
import com.petmily.backend.api.notification.dto.PushTokenRequest;
import com.petmily.backend.domain.mall.order.entity.Order;
import com.petmily.backend.domain.mall.order.entity.OrderStatus;
import com.petmily.backend.domain.mall.subscription.entity.Subscription;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.user.entity.NotificationSetting;
import com.petmily.backend.domain.user.repository.NotificationSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final UserRepository userRepository;
    private final NotificationSettingRepository notificationSettingRepository;
    private final PushNotificationSender pushNotificationSender;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String PUSH_TOKEN_KEY = "push_token:user:";
    private static final String NOTIFICATION_HISTORY_KEY = "notification_history:";

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * 알림 설정 조회
     */
    public NotificationSettingsResponse getNotificationSettings(Long userId) {
        User user = findUserById(userId);

        NotificationSetting setting = notificationSettingRepository
                .findByUserId(user.getId())
                .orElse(createDefaultNotificationSettings(user.getId()));

        return NotificationSettingsResponse.from(setting);
    }

    /**
     * 알림 설정 업데이트
     */
    @Transactional
    public NotificationSettingsResponse updateNotificationSettings(Long userId,
                                                                   NotificationSettingsRequest request) {
        User user = findUserById(userId);

        NotificationSetting setting = notificationSettingRepository
                .findByUserId(user.getId())
                .orElse(createDefaultNotificationSettings(user.getId()));

        // 요청된 설정만 업데이트
        if (request.getDepartureAlertEnabled() != null) {
            setting.setDepartureAlertEnabled(request.getDepartureAlertEnabled());
        }
        if (request.getDepartureDistanceThreshold() != null) {
            setting.setDepartureDistanceThreshold(request.getDepartureDistanceThreshold());
        }
        if (request.getDelayAlertEnabled() != null) {
            setting.setDelayAlertEnabled(request.getDelayAlertEnabled());
        }
        if (request.getDelayTimeThreshold() != null) {
            setting.setDelayTimeThreshold(request.getDelayTimeThreshold());
        }
        if (request.getWalkStartNotification() != null) {
            setting.setWalkStartNotification(request.getWalkStartNotification());
        }
        if (request.getWalkCompleteNotification() != null) {
            setting.setWalkCompleteNotification(request.getWalkCompleteNotification());
        }
        if (request.getEmergencyNotification() != null) {
            setting.setEmergencyNotification(request.getEmergencyNotification());
        }
        if (request.getSmsEnabled() != null) {
            setting.setSmsEnabled(request.getSmsEnabled());
        }
        if (request.getPushEnabled() != null) {
            setting.setPushEnabled(request.getPushEnabled());
        }
        if (request.getEmailEnabled() != null) {
            setting.setEmailEnabled(request.getEmailEnabled());
        }

        NotificationSetting saved = notificationSettingRepository.save(setting);
        return NotificationSettingsResponse.from(saved);
    }

    /**
     * 푸시 토큰 등록
     */
    @Transactional
    public void registerPushToken(Long userId, PushTokenRequest request) {
        User user = findUserById(userId);
        String key = PUSH_TOKEN_KEY + user.getId();

        // Redis에 토큰 저장 (30일 만료)
        redisTemplate.opsForValue().set(key, request.getToken(), 30, TimeUnit.DAYS);

        log.info("Push token registered for user: {} (Device: {})", user.getUsername(), request.getDeviceType());
    }

    /**
     * 푸시 토큰 해제
     */
    @Transactional
    public void unregisterPushToken(Long userId, PushTokenRequest request) {
        User user = findUserById(userId);
        String key = PUSH_TOKEN_KEY + user.getId();

        String storedToken = (String) redisTemplate.opsForValue().get(key);
        if (request.getToken().equals(storedToken)) {
            redisTemplate.delete(key);
            log.info("Push token unregistered for user: {}", user.getUsername());
        }
    }

    /**
     * 푸시 알림 전송
     */
    public void sendPushNotification(PushNotificationRequest request) {
        try {
            if (request.getUserId() != null) {
                // 특정 사용자에게 전송
                sendToUser(request.getUserId(), request);
            } else if (request.getTokens() != null && !request.getTokens().isEmpty()) {
                // 특정 토큰들에게 전송
                pushNotificationSender.sendToTokens(request.getTokens(), request);
            } else if (request.getTopic() != null) {
                // 토픽 구독자들에게 전송
                pushNotificationSender.sendToTopic(request.getTopic(), request);
            } else if (request.getCondition() != null) {
                // 조건부 전송
                pushNotificationSender.sendToCondition(request.getCondition(), request);
            } else {
                throw new CustomException(ErrorCode.INVALID_REQUEST, "알림 대상을 지정해야 합니다.");
            }

            log.info("Push notification sent: {} - {}", request.getTitle(), request.getBody());
        } catch (Exception e) {
            log.error("Failed to send push notification", e);
            throw new CustomException(ErrorCode.INTERNAL_ERROR, "푸시 알림 전송에 실패했습니다.");
        }
    }

    /**
     * 특정 사용자에게 푸시 알림 전송
     */
    private void sendToUser(Long userId, PushNotificationRequest request) {
        String key = PUSH_TOKEN_KEY + userId;
        String token = (String) redisTemplate.opsForValue().get(key);

        if (token != null) {
            pushNotificationSender.sendToToken(token, request);

            // 알림 기록 저장
            saveNotificationHistory(userId, request);
        } else {
            log.warn("No push token found for user: {}", userId);
        }
    }

    /**
     * 알림 기록 저장
     */
    private void saveNotificationHistory(Long userId, PushNotificationRequest request) {
        String key = NOTIFICATION_HISTORY_KEY + userId;
        String record = String.format("%s:%s:%d",
                request.getTitle(),
                request.getBody(),
                System.currentTimeMillis());

        redisTemplate.opsForList().leftPush(key, record);
        redisTemplate.opsForList().trim(key, 0, 49); // 최대 50개 유지
        redisTemplate.expire(key, 30, TimeUnit.DAYS);
    }

    /**
     * 알림 기록 조회
     */
    public List<Object> getNotificationHistory(Long userId) {
        String key = NOTIFICATION_HISTORY_KEY + userId;
        return redisTemplate.opsForList().range(key, 0, -1);
    }

    /**
     * 산책 알림 기록 조회 (기존 코드와 연동)
     */
    public List<Object> getWalkNotificationHistory(Long bookingId) {
        String key = "walk:notification:count:" + bookingId;
        return redisTemplate.opsForList().range(key, 0, -1);
    }

    /**
     * 모든 사용자에게 공지사항 전송
     */
    public void sendAnnouncementToAll(String title, String body) {
        PushNotificationRequest request = PushNotificationRequest.builder()
                .title(title)
                .body(body)
                .topic("all_users") // 모든 사용자가 구독하는 토픽
                .priority("normal")
                .build();

        sendPushNotification(request);
    }

    /**
     * 워커들에게 공지사항 전송
     */
    public void sendAnnouncementToWalkers(String title, String body) {
        PushNotificationRequest request = PushNotificationRequest.builder()
                .title(title)
                .body(body)
                .topic("walkers") // 워커들이 구독하는 토픽
                .priority("normal")
                .build();

        sendPushNotification(request);
    }

    /**
     * 사용자별 맞춤 알림 전송
     */
    public void sendCustomNotificationToUser(Long userId, String title, String body, String type) {
        NotificationSetting setting = notificationSettingRepository
                .findByUserId(userId)
                .orElse(null);

        // 사용자 설정 확인
        if (setting != null && !setting.getPushEnabled()) {
            log.info("Push notification disabled for user: {}", userId);
            return;
        }

        PushNotificationRequest request = PushNotificationRequest.builder()
                .title(title)
                .body(body)
                .userId(userId)
                .data(Map.of("type", type, "timestamp", System.currentTimeMillis()))
                .priority("normal")
                .build();

        sendPushNotification(request);
    }

    /**
     * 긴급 알림 전송 (설정 무시하고 강제 전송)
     */
    public void sendEmergencyNotification(Long userId, String title, String body) {
        PushNotificationRequest request = PushNotificationRequest.builder()
                .title("[긴급] " + title)
                .body(body)
                .userId(userId)
                .priority("high")
                .sound("emergency")
                .build();

        sendPushNotification(request);
    }

    public void sendOrderCreatedNotification(Order order) {
        PushNotificationRequest request = PushNotificationRequest.builder()
                .userId(order.getUser().getId())
                .title("주문이 접수되었습니다")
                .body("주문번호: " + order.getOrderNumber() + " | " + order.getOrderItems().size() + "개 상품")
                .data(Map.of(
                        "type", "ORDER",
                        "orderId", order.getId().toString(),
                        "orderNumber", order.getOrderNumber()
                ))
                .build();

        sendPushNotification(request);
    }

    /**
     * 주문 상태 변경 알림 전송
     */
    public void sendOrderStatusNotification(Order order, OrderStatus newStatus) {
        String message = switch (newStatus) {
            case PAID -> "주문이 결제되었습니다.";
            case PREPARING -> "상품 준비 중입니다.";
            case SHIPPED -> "상품이 배송 시작되었습니다. 운송장: " +
                    (order.getDeliveryInfo().getTrackingNumber() != null ?
                            order.getDeliveryInfo().getTrackingNumber() : "정보 없음");
            case DELIVERED -> "상품이 배송 완료되었습니다.";
            case CANCELED -> "주문이 취소되었습니다.";
            case REFUNDED -> "환불이 완료되었습니다.";
            default -> "주문 상태가 변경되었습니다.";
        };

        PushNotificationRequest request = PushNotificationRequest.builder()
                .userId(order.getUser().getId())
                .title("주문 " + order.getOrderNumber())
                .body(message)
                .data(Map.of(
                        "type", "ORDER_STATUS",
                        "orderId", order.getId().toString(),
                        "status", newStatus.name()
                ))
                .build();

        sendPushNotification(request);
    }

    public void sendSubscriptionPausedNotification(Subscription subscription, String reason) {
        String productName = subscription.getProduct().getName();

        PushNotificationRequest request = PushNotificationRequest.builder()
                .userId(subscription.getUser().getId())
                .title("정기배송이 일시정지되었습니다")
                .body(productName + " - " + reason)
                .data(Map.of(
                        "type", "SUBSCRIPTION_PAUSED",
                        "subscriptionId", subscription.getId().toString(),
                        "productId", subscription.getProduct().getId().toString(),
                        "reason", reason
                ))
                .priority("high")
                .build();

        sendPushNotification(request);
    }

    public void sendSubscriptionOrderCreatedNotification(Order order, Subscription subscription){
        String productName = subscription.getProduct().getName();
        String cycleDisplayName = subscription.getCycle().getDisplayName();

        PushNotificationRequest request = PushNotificationRequest.builder()
                .userId(subscription.getUser().getId())
                .title("정기배송 주문이 자동으로 생성되었습니다")
                .body(productName + " (" + cycleDisplayName + ") | " +
                        order.getTotalAmount() + "원 결제 완료")
                .data(Map.of(
                        "type", "SUBSCRIPTION_ORDER",
                        "orderId", order.getId().toString(),
                        "orderNumber", order.getOrderNumber(),
                        "subscriptionId", subscription.getId().toString(),
                        "nextDeliveryDate", subscription.getNextDeliveryDate().toString()
                ))
                .build();

        sendPushNotification(request);
    }

    private NotificationSetting createDefaultNotificationSettings(Long userId) {
        return NotificationSetting.builder()
                .userId(userId)
                .build(); // 기본값들이 이미 설정되어 있음
    }
}