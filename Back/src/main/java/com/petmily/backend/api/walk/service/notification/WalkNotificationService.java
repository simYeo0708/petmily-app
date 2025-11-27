package com.petmily.backend.api.walk.service.notification;

import com.petmily.backend.domain.walk.entity.WalkingTrack;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walk.repository.WalkTrackRepository;
import com.petmily.backend.domain.walker.entity.Walker;
import com.petmily.backend.domain.walker.repository.WalkerRepository;
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
    private final WalkTrackRepository walkTrackRepository;
    private final WalkerRepository walkerRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String LAST_NOTIFICATION_KEY = "walk:notification:last:";
    private static final String NOTIFICATION_COUNT_KEY = "walk:notification:count:";
    private static final int NOTIFICATION_INTERVAL_MINUTES = 10;

    /**
     * 산책 시작 알림 발송
     */
    public void sendWalkStartNotification(WalkBooking booking, String petName, String ownerContact) {
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
    public void sendWalkProgressNotification(WalkBooking booking, String petName, String ownerContact) {
        try {
            // 마지막 알림 발송 시간 확인
            if (!shouldSendProgressNotification(booking.getId())) {
                return;
            }

            List<WalkingTrack> tracks = walkTrackRepository.findByBookingIdOrderByTimestampAsc(booking.getId());
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
    public void sendWalkCompleteNotification(WalkBooking booking, String petName, String ownerContact) {
        try {
            List<WalkingTrack> tracks = walkTrackRepository.findByBookingIdOrderByTimestampAsc(booking.getId());
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
    public void sendStationaryAlertNotification(WalkBooking booking, String petName, String ownerContact, int minutes) {
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

        // 실제 운영 환경에서는 사용자의 카카오톡 액세스 토큰을 가져와서 사용
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
     * 긴급상황 알림 발송
     */
    public void sendEmergencyNotification(WalkBooking booking, String petName, String emergencyType,
                                        String location, String description) {
        try {
            String message = String.format(
                "[긴급상황 발생]\n" +
                "펫: %s\n" +
                "긴급상황 유형: %s\n" +
                "위치: %s\n" +
                "상황 설명: %s\n" +
                "즉시 확인 부탁드립니다.",
                petName, emergencyType, location != null ? location : "위치 정보 없음",
                description != null ? description : "상세 설명 없음"
            );

            String ownerContact = getOwnerContact(booking);
            boolean sent = sendNotification(ownerContact, message);
            if (sent) {
                saveNotificationRecord(booking.getId(), "EMERGENCY");
                log.info("긴급상황 알림 발송 완료 - Booking ID: {}, Type: {}", booking.getId(), emergencyType);
            }
        } catch (Exception e) {
            log.error("긴급상황 알림 발송 중 오류 발생 - Booking ID: {}", booking.getId(), e);
        }
    }

    /**
     * 산책 종료 요청 알림 발송
     */
    public void sendWalkTerminationRequest(WalkBooking booking, String petName, String requestedBy, String reason) {
        try {
            String message = String.format(
                "[산책 종료 요청]\n" +
                "펫: %s\n" +
                "요청자: %s\n" +
                "종료 사유: %s\n" +
                "확인 후 응답 부탁드립니다.",
                petName, requestedBy, reason
            );

            String targetContact = "WALKER".equals(requestedBy) ? getOwnerContact(booking) : getWalkerContact(booking);
            boolean sent = sendNotification(targetContact, message);
            if (sent) {
                saveNotificationRecord(booking.getId(), "TERMINATION_REQUEST");
                log.info("산책 종료 요청 알림 발송 완료 - Booking ID: {}, Requested by: {}", booking.getId(), requestedBy);
            }
        } catch (Exception e) {
            log.error("산책 종료 요청 알림 발송 중 오류 발생 - Booking ID: {}", booking.getId(), e);
        }
    }

    private String getOwnerContact(WalkBooking booking) {
        if (booking.getUser() != null) {
            if (booking.getUser().getPhone() != null && !booking.getUser().getPhone().trim().isEmpty()) {
                return booking.getUser().getPhone();
            } else if (booking.getUser().getEmail() != null && !booking.getUser().getEmail().trim().isEmpty()) {
                return booking.getUser().getEmail();
            }
        }
        return "연락처 없음";
    }

    private String getWalkerContact(WalkBooking booking) {
        if (booking.getWalkerId() == null) {
            return "연락처 없음";
        }

        Walker walker = walkerRepository.findById(booking.getWalkerId()).orElse(null);
        if (walker == null || walker.getUser() == null) {
            return "연락처 없음";
        }

        if (walker.getUser().getPhone() != null && !walker.getUser().getPhone().trim().isEmpty()) {
            return walker.getUser().getPhone();
        } else if (walker.getUser().getEmail() != null && !walker.getUser().getEmail().trim().isEmpty()) {
            return walker.getUser().getEmail();
        }

        return "연락처 없음";
    }

    /**
     * 특정 booking의 알림 발송 이력 조회
     */
    public List<Object> getNotificationHistory(Long bookingId) {
        String key = NOTIFICATION_COUNT_KEY + bookingId;
        return redisTemplate.opsForList().range(key, 0, -1);
    }
}