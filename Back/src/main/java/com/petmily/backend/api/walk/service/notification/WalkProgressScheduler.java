package com.petmily.backend.api.walk.service.notification;

import com.petmily.backend.api.common.service.LocationValidationService;
import com.petmily.backend.domain.pet.repository.PetRepository;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walk.entity.WalkingTrack;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walk.repository.WalkBookingRepository;
import com.petmily.backend.domain.walk.repository.WalkTrackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalkProgressScheduler {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final WalkBookingRepository walkBookingRepository;
    private final WalkTrackRepository walkTrackRepository;
    private final WalkNotificationService notificationService;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String STATIONARY_CHECK_KEY = "walk:stationary:";
    private static final int STATIONARY_THRESHOLD_MINUTES = 5; // 5분 이상 같은 장소
    private static final double LOCATION_THRESHOLD_METERS = 20; // 20미터 이내를 같은 장소로 간주

    /**
     * 10분마다 진행 중인 산책들의 상태를 체크하고 알림 발송
     */
    @Scheduled(fixedRate = 600000) // 10분 = 600,000ms
    public void checkWalkingProgress() {
        log.debug("산책 진행 상황 체크 시작");
        
        try {
            List<WalkBooking> activeWalks = getActiveWalks();
            log.info("현재 진행 중인 산책 수: {}", activeWalks.size());

            for (WalkBooking booking : activeWalks) {
                processWalkBooking(booking);
            }
        } catch (Exception e) {
            log.error("산책 진행 상황 체크 중 오류 발생", e);
        }
    }

    /**
     * 5분마다 정지 상태 체크 (같은 장소에 오래 머물고 있는지)
     */
    @Scheduled(fixedRate = 300000) // 5분 = 300,000ms
    public void checkStationaryStatus() {
        log.debug("산책 정지 상태 체크 시작");
        
        try {
            List<WalkBooking> activeWalks = getActiveWalks();

            for (WalkBooking booking : activeWalks) {
                checkStationaryAlert(booking);
            }
        } catch (Exception e) {
            log.error("산책 정지 상태 체크 중 오류 발생", e);
        }
    }

    /**
     * 현재 진행 중인 산책 목록 조회
     */
    private List<WalkBooking> getActiveWalks() {
        return walkBookingRepository.findByStatus(WalkBooking.BookingStatus.IN_PROGRESS);
    }

    /**
     * 개별 산책 예약 처리
     */
    private void processWalkBooking(WalkBooking booking) {
        try {
            String petName = getPetName(booking);
            String ownerContact = getOwnerContact(booking);

            // 진행 상황 알림 발송
            notificationService.sendWalkProgressNotification(booking, petName, ownerContact);

            log.debug("산책 진행 상황 처리 완료 - Booking ID: {}, Pet: {}", booking.getId(), petName);
        } catch (Exception e) {
            log.error("산책 예약 처리 중 오류 발생 - Booking ID: {}", booking.getId(), e);
        }
    }

    /**
     * 정지 상태 알림 체크
     */
    private void checkStationaryAlert(WalkBooking booking) {
        try {
            LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(STATIONARY_THRESHOLD_MINUTES);
            List<WalkingTrack> recentTracks = walkTrackRepository
                    .findByBookingIdAndTimestampAfter(booking.getId(), cutoffTime);

            if (recentTracks.isEmpty()) {
                return;
            }

            // 최근 위치들이 모두 비슷한 위치인지 확인
            if (isStationaryLocation(recentTracks)) {
                String stationaryKey = STATIONARY_CHECK_KEY + booking.getId();
                String lastAlertTime = (String) redisTemplate.opsForValue().get(stationaryKey);

                // 이미 알림을 보낸 적이 있는지 확인
                if (lastAlertTime == null || shouldSendStationaryAlert(lastAlertTime)) {
                    String petName = getPetName(booking);
                    String ownerContact = getOwnerContact(booking);

                    notificationService.sendStationaryAlertNotification(
                            booking, petName, ownerContact, STATIONARY_THRESHOLD_MINUTES);

                    // 알림 발송 시간 기록
                    redisTemplate.opsForValue().set(stationaryKey, LocalDateTime.now().toString());
                }
            }
        } catch (Exception e) {
            log.error("정지 상태 체크 중 오류 발생 - Booking ID: {}", booking.getId(), e);
        }
    }

    /**
     * 위치들이 정지 상태인지 확인
     */
    private boolean isStationaryLocation(List<WalkingTrack> tracks) {
        if (tracks.size() < 3) {
            return false;
        }

        WalkingTrack baseLocation = tracks.get(0);
        
        for (WalkingTrack track : tracks) {
            double distanceKm = LocationValidationService.calculateDistance(
                    baseLocation.getLatitude(), baseLocation.getLongitude(),
                    track.getLatitude(), track.getLongitude()
            );

            double distanceMeters = distanceKm * 1000; // km를 미터로 변환

            // 기준점에서 20미터 이상 떨어진 위치가 있으면 정지 상태가 아님
            if (distanceMeters > LOCATION_THRESHOLD_METERS) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * 정지 상태 알림을 보낼지 결정
     */
    private boolean shouldSendStationaryAlert(String lastAlertTime) {
        try {
            LocalDateTime lastTime = LocalDateTime.parse(lastAlertTime);
            // 마지막 알림으로부터 30분이 지나야 다시 알림 발송
            return LocalDateTime.now().isAfter(lastTime.plusMinutes(30));
        } catch (Exception e) {
            return true; // 파싱 오류 시 알림 발송
        }
    }


    /**
     * 펫 이름 조회 (실제 구현에서는 Pet 엔티티 연동 필요)
     */
    private String getPetName(WalkBooking booking) {
        String name = petRepository.findById(booking.getPetId()).get().getName();
        return name; // 임시 기본값
    }

    /**
     * 보호자 연락처 조회 (실제 구현에서는 User 엔티티 연동 필요)
     */
    private String getOwnerContact(WalkBooking booking) {
        String phone = userRepository.findById(booking.getUserId()).get().getPhone();
        return phone; // 임시 기본값
    }

    /**
     * 스케줄러 상태 정보 조회 (모니터링용)
     */
    public Map<String, Object> getSchedulerStatus() {
        try {
            List<WalkBooking> activeWalks = getActiveWalks();
            
            return Map.of(
                "activeWalks", activeWalks.size(),
                "walkBookingIds", activeWalks.stream()
                        .map(WalkBooking::getId)
                        .collect(Collectors.toList()),
                "lastCheckTime", LocalDateTime.now().toString(),
                "schedulerEnabled", true
            );
        } catch (Exception e) {
            log.error("스케줄러 상태 조회 중 오류 발생", e);
            return Map.of(
                "error", e.getMessage(),
                "lastCheckTime", LocalDateTime.now().toString(),
                "schedulerEnabled", false
            );
        }
    }
}