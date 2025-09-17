package com.petmily.backend.api.walker.service.notification;

import com.petmily.backend.domain.walker.entity.WalkingTrack;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import com.petmily.backend.domain.walker.repository.WalkingTrackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalkNotificationService {

    private final GeminiMessageGenerator messageGenerator;
    private final KakaoMessageSender messageSender;
    private final WalkingTrackRepository walkingTrackRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String LAST_NOTIFICATION_KEY = "walk:notification:last:";
    private static final String NOTIFICATION_COUNT_KEY = "walk:notification:count:";
    private static final int NOTIFICATION_INTERVAL_MINUTES = 10;

    /**
     * 산책 시작 알림 발송
     */
    public void sendWalkStartNotification(WalkerBooking booking, String petName, String ownerContact) {
        try {
            String message = messageGenerator.generateWalkStartMessage(booking, petName);
            
            boolean sent = sendNotification(ownerContact, message);
            if (sent) {
                // Redis에 알림 발송 기록
                saveNotificationRecord(booking.getId(), "START");
                log.info("산책 시작 알림 발송 완료 - Booking ID: {}, Pet: {}", booking.getId(), petName);
            }
        } catch (Exception e) {
            log.error("산책 시작 알림 발송 중 오류 발생 - Booking ID: {}", booking.getId(), e);
        }
    }

    /**
     * 산책 진행 상황 알림 발송
     */
    public void sendWalkProgressNotification(WalkerBooking booking, String petName, String ownerContact) {
        try {
            // 마지막 알림 발송 시간 확인
            if (!shouldSendProgressNotification(booking.getId())) {
                return;
            }

            List<WalkingTrack> tracks = walkingTrackRepository.findByBookingIdOrderByTimestampAsc(booking.getId());
            String message = messageGenerator.generateWalkProgressMessage(booking, tracks, petName);
            
            boolean sent = sendNotification(ownerContact, message);
            if (sent) {
                saveNotificationRecord(booking.getId(), "PROGRESS");
                updateLastNotificationTime(booking.getId());
                log.info("산책 진행 상황 알림 발송 완료 - Booking ID: {}, Pet: {}", booking.getId(), petName);
            }
        } catch (Exception e) {
            log.error("산책 진행 상황 알림 발송 중 오류 발생 - Booking ID: {}", booking.getId(), e);
        }
    }

    /**
     * 산책 완료 알림 발송
     */
    public void sendWalkCompleteNotification(WalkerBooking booking, String petName, String ownerContact) {
        try {
            List<WalkingTrack> tracks = walkingTrackRepository.findByBookingIdOrderByTimestampAsc(booking.getId());
            String message = messageGenerator.generateWalkCompleteMessage(booking, tracks, petName);
            
            boolean sent = sendNotification(ownerContact, message);
            if (sent) {
                saveNotificationRecord(booking.getId(), "COMPLETE");
                cleanupNotificationData(booking.getId());
                log.info("산책 완료 알림 발송 완료 - Booking ID: {}, Pet: {}", booking.getId(), petName);
            }
        } catch (Exception e) {
            log.error("산책 완료 알림 발송 중 오류 발생 - Booking ID: {}", booking.getId(), e);
        }
    }

    /**
     * 정지 상태 알림 발송 (같은 장소에 오래 머물 때)
     */
    public void sendStationaryAlertNotification(WalkerBooking booking, String petName, String ownerContact, int minutes) {
        try {
            String message = messageGenerator.generateStationaryAlertMessage(petName, minutes);
            
            boolean sent = sendNotification(ownerContact, message);
            if (sent) {
                saveNotificationRecord(booking.getId(), "STATIONARY_ALERT");
                log.info("정지 상태 알림 발송 완료 - Booking ID: {}, Pet: {}, Minutes: {}", 
                        booking.getId(), petName, minutes);
            }
        } catch (Exception e) {
            log.error("정지 상태 알림 발송 중 오류 발생 - Booking ID: {}", booking.getId(), e);
        }
    }

    /**
     * 실제 메시지 발송 처리
     */
    private boolean sendNotification(String ownerContact, String message) {
        if (!messageSender.isMessageSendingAvailable()) {
            // 개발 환경에서는 로그로 출력
            messageSender.logMessageForDevelopment(ownerContact, message);
            return true;
        }

        // TODO: 실제 운영 환경에서는 사용자의 카카오톡 액세스 토큰을 가져와서 사용
        // 현재는 개발용으로 로그 출력
        messageSender.logMessageForDevelopment(ownerContact, message);
        
        // 실제 구현 시:
        // String userAccessToken = getUserAccessToken(ownerContact);
        // return messageSender.sendMessageToFriend(userAccessToken, message);
        
        return true;
    }

    /**
     * 진행 상황 알림 발송 여부 확인
     */
    private boolean shouldSendProgressNotification(Long bookingId) {
        String key = LAST_NOTIFICATION_KEY + bookingId;
        String lastNotificationTime = (String) redisTemplate.opsForValue().get(key);
        
        if (lastNotificationTime == null) {
            return true;
        }
        
        LocalDateTime lastTime = LocalDateTime.parse(lastNotificationTime);
        LocalDateTime now = LocalDateTime.now();
        
        return now.isAfter(lastTime.plusMinutes(NOTIFICATION_INTERVAL_MINUTES));
    }

    /**
     * 마지막 알림 발송 시간 업데이트
     */
    private void updateLastNotificationTime(Long bookingId) {
        String key = LAST_NOTIFICATION_KEY + bookingId;
        redisTemplate.opsForValue().set(key, LocalDateTime.now().toString(), 24, TimeUnit.HOURS);
    }

    /**
     * 알림 발송 기록 저장
     */
    private void saveNotificationRecord(Long bookingId, String notificationType) {
        String key = NOTIFICATION_COUNT_KEY + bookingId;
        redisTemplate.opsForList().rightPush(key, 
            String.format("%s:%s", notificationType, LocalDateTime.now().toString()));
        redisTemplate.expire(key, 24, TimeUnit.HOURS);
    }

    /**
     * 알림 관련 데이터 정리
     */
    private void cleanupNotificationData(Long bookingId) {
        String lastKey = LAST_NOTIFICATION_KEY + bookingId;
        String countKey = NOTIFICATION_COUNT_KEY + bookingId;
        
        redisTemplate.delete(lastKey);
        redisTemplate.delete(countKey);
    }

    /**
     * 특정 booking의 알림 발송 이력 조회
     */
    public List<Object> getNotificationHistory(Long bookingId) {
        String key = NOTIFICATION_COUNT_KEY + bookingId;
        return redisTemplate.opsForList().range(key, 0, -1);
    }
}