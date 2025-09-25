package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.InvalidCoordinatesException;
import com.petmily.backend.api.exception.LocationRequiredException;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.walker.entity.WalkingTrack;
import com.petmily.backend.domain.walker.repository.WalkingTrackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationValidationService {

    private final WalkingTrackRepository walkingTrackRepository;

    // 한국 대략적 좌표 범위
    private static final double KOREA_MIN_LATITUDE = 33.0;
    private static final double KOREA_MAX_LATITUDE = 39.0;
    private static final double KOREA_MIN_LONGITUDE = 124.0;
    private static final double KOREA_MAX_LONGITUDE = 132.0;

    // 최대 이동 속도 (km/h) - 뛰어다니는 강아지 기준
    private static final double MAX_SPEED_KMH = 50.0;

    /**
     * 기본 좌표 유효성 검증
     */
    public void validateCoordinates(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new LocationRequiredException("위도와 경도 정보가 필요합니다.");
        }

        if (!isValidLatitude(latitude)) {
            throw new InvalidCoordinatesException(latitude, longitude);
        }

        if (!isValidLongitude(longitude)) {
            throw new InvalidCoordinatesException(latitude, longitude);
        }
    }

    /**
     * 한국 내 좌표인지 검증 (선택적)
     */
    public void validateKoreaCoordinates(Double latitude, Double longitude) {
        validateCoordinates(latitude, longitude);

        if (!isWithinKorea(latitude, longitude)) {
            log.warn("한국 범위를 벗어난 좌표: 위도={}, 경도={}", latitude, longitude);
            // 경고만 로그로 남기고 예외는 발생시키지 않음 (해외 여행 등 고려)
        }
    }

    /**
     * 위치 변화 속도 검증
     */
    public void validateLocationChange(Long bookingId, Double newLatitude, Double newLongitude) {
        validateCoordinates(newLatitude, newLongitude);

        Optional<WalkingTrack> lastTrack = walkingTrackRepository.findTopByBookingIdOrderByTimestampDesc(bookingId);
        
        if (lastTrack.isEmpty()) {
            // 첫 번째 위치 기록이면 검증 생략
            return;
        }

        WalkingTrack previous = lastTrack.get();
        double distanceKm = calculateDistance(
            previous.getLatitude(), previous.getLongitude(),
            newLatitude, newLongitude
        );

        long timeDiffSeconds = ChronoUnit.SECONDS.between(previous.getTimestamp(), LocalDateTime.now());
        if (timeDiffSeconds <= 0) {
            return; // 시간 차이가 0 이하면 검증 생략
        }

        double speedKmh = (distanceKm / timeDiffSeconds) * 3600; // 시속 계산

        if (speedKmh > MAX_SPEED_KMH) {
            log.warn("비현실적인 이동 속도 감지: {}km/h, 거리: {}km, 시간: {}초", 
                     speedKmh, distanceKm, timeDiffSeconds);
            
            throw new CustomException(ErrorCode.UNREALISTIC_LOCATION_CHANGE,
                String.format("이동 속도가 너무 빠릅니다. (%.1fkm/h)", speedKmh));
        }
    }

    /**
     * 위치 정보 필수 체크
     */
    public void requireLocation(Double latitude, Double longitude, String context) {
        if (latitude == null || longitude == null) {
            throw new LocationRequiredException(context + "을(를) 위해 위치 정보가 필요합니다.");
        }
        validateCoordinates(latitude, longitude);
    }

    /**
     * 연속 동일 좌표 체크 (GPS 오작동 감지)
     */
    public boolean isProbablyFakeLocation(Long bookingId, Double latitude, Double longitude) {
        var recentTracks = walkingTrackRepository.findTop5ByBookingIdOrderByTimestampDesc(bookingId);
        
        if (recentTracks.size() < 3) {
            return false; // 데이터가 충분하지 않으면 false
        }

        // 최근 3개 위치가 모두 동일한지 확인
        boolean allSame = recentTracks.stream()
            .allMatch(track -> 
                Math.abs(track.getLatitude() - latitude) < 0.00001 &&
                Math.abs(track.getLongitude() - longitude) < 0.00001
            );

        if (allSame) {
            log.warn("의심스러운 위치 패턴 감지 - 동일 좌표 반복: {}, {}", latitude, longitude);
        }

        return allSame;
    }


    private boolean isValidLatitude(Double latitude) {
        return latitude >= -90.0 && latitude <= 90.0;
    }

    private boolean isValidLongitude(Double longitude) {
        return longitude >= -180.0 && longitude <= 180.0;
    }

    private boolean isWithinKorea(Double latitude, Double longitude) {
        return latitude >= KOREA_MIN_LATITUDE && latitude <= KOREA_MAX_LATITUDE &&
               longitude >= KOREA_MIN_LONGITUDE && longitude <= KOREA_MAX_LONGITUDE;
    }

    /**
     * Haversine 공식으로 두 좌표 간 거리 계산 (단위: km)
     */
    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final double R = 6371; // 지구 반지름 (km)
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
                
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // 거리 반환 (km)
    }
}