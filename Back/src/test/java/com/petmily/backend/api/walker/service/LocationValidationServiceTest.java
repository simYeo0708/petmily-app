package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.exception.InvalidCoordinatesException;
import com.petmily.backend.api.exception.LocationRequiredException;
import com.petmily.backend.api.common.service.LocationValidationService;
import com.petmily.backend.domain.walk.entity.WalkingTrack;
import com.petmily.backend.domain.walk.repository.WalkTrackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LocationValidationServiceTest {

    @Mock
    private WalkTrackRepository walkTrackRepository;

    @InjectMocks
    private LocationValidationService locationValidationService;

    private WalkingTrack previousTrack;
    private List<WalkingTrack> recentTracks;

    @BeforeEach
    void setUp() {
        previousTrack = WalkingTrack.builder()
                .bookingId(1L)
                .latitude(37.5665)
                .longitude(126.9780)
                .timestamp(LocalDateTime.now().minusMinutes(1))
                .build();

        recentTracks = Arrays.asList(
                createTrack(1L, 37.5665, 126.9780),
                createTrack(2L, 37.5665, 126.9780),
                createTrack(3L, 37.5665, 126.9780),
                createTrack(4L, 37.5665, 126.9780),
                createTrack(5L, 37.5665, 126.9780)
        );
    }

    @Test
    @DisplayName("좌표 유효성 검증 성공 - 유효한 좌표")
    void validateCoordinates_Success() {
        // Given
        Double latitude = 37.5665;
        Double longitude = 126.9780;

        // When & Then
        assertThatCode(() -> locationValidationService.validateCoordinates(latitude, longitude))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("좌표 유효성 검증 실패 - null 위도")
    void validateCoordinates_NullLatitude() {
        // Given
        Double latitude = null;
        Double longitude = 126.9780;

        // When & Then
        assertThatThrownBy(() -> locationValidationService.validateCoordinates(latitude, longitude))
                .isInstanceOf(LocationRequiredException.class)
                .hasMessageContaining("위도와 경도 정보가 필요합니다");
    }

    @Test
    @DisplayName("좌표 유효성 검증 실패 - null 경도")
    void validateCoordinates_NullLongitude() {
        // Given
        Double latitude = 37.5665;
        Double longitude = null;

        // When & Then
        assertThatThrownBy(() -> locationValidationService.validateCoordinates(latitude, longitude))
                .isInstanceOf(LocationRequiredException.class)
                .hasMessageContaining("위도와 경도 정보가 필요합니다");
    }

    @Test
    @DisplayName("좌표 유효성 검증 실패 - 잘못된 위도 범위")
    void validateCoordinates_InvalidLatitude() {
        // Given
        Double latitude = 91.0; // 위도는 -90 ~ 90 범위
        Double longitude = 126.9780;

        // When & Then
        assertThatThrownBy(() -> locationValidationService.validateCoordinates(latitude, longitude))
                .isInstanceOf(InvalidCoordinatesException.class);
    }

    @Test
    @DisplayName("좌표 유효성 검증 실패 - 잘못된 경도 범위")
    void validateCoordinates_InvalidLongitude() {
        // Given
        Double latitude = 37.5665;
        Double longitude = 181.0; // 경도는 -180 ~ 180 범위

        // When & Then
        assertThatThrownBy(() -> locationValidationService.validateCoordinates(latitude, longitude))
                .isInstanceOf(InvalidCoordinatesException.class);
    }

    @Test
    @DisplayName("좌표 유효성 검증 - 경계값 테스트")
    void validateCoordinates_BoundaryValues() {
        // When & Then
        assertThatCode(() -> locationValidationService.validateCoordinates(90.0, 180.0))
                .doesNotThrowAnyException();
        assertThatCode(() -> locationValidationService.validateCoordinates(-90.0, -180.0))
                .doesNotThrowAnyException();
        assertThatCode(() -> locationValidationService.validateCoordinates(0.0, 0.0))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("한국 좌표 검증 성공")
    void validateKoreaCoordinates_Success() {
        // Given
        Double latitude = 37.5665; // Seoul
        Double longitude = 126.9780;

        // When & Then
        assertThatCode(() -> locationValidationService.validateKoreaCoordinates(latitude, longitude))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("한국 좌표 검증 - 한국 범위 밖 (경고만 로그)")
    void validateKoreaCoordinates_OutsideKorea() {
        // Given
        Double latitude = 35.6762; // Tokyo
        Double longitude = 139.6503;

        // When & Then
        // 한국 범위를 벗어나도 예외가 발생하지 않음 (경고만 로그)
        assertThatCode(() -> locationValidationService.validateKoreaCoordinates(latitude, longitude))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("위치 변화 검증 성공 - 첫 번째 위치")
    void validateLocationChange_FirstLocation() {
        // Given
        Long bookingId = 1L;
        Double newLatitude = 37.5665;
        Double newLongitude = 126.9780;

        when(walkTrackRepository.findTopByBookingIdOrderByTimestampDesc(bookingId))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatCode(() -> locationValidationService.validateLocationChange(bookingId, newLatitude, newLongitude))
                .doesNotThrowAnyException();

        verify(walkTrackRepository).findTopByBookingIdOrderByTimestampDesc(bookingId);
    }

    @Test
    @DisplayName("위치 변화 검증 성공 - 정상적인 이동")
    void validateLocationChange_NormalMovement() {
        // Given
        Long bookingId = 1L;
        Double newLatitude = 37.5666; // 약 11m 이동
        Double newLongitude = 126.9781;

        when(walkTrackRepository.findTopByBookingIdOrderByTimestampDesc(bookingId))
                .thenReturn(Optional.of(previousTrack));

        // When & Then
        assertThatCode(() -> locationValidationService.validateLocationChange(bookingId, newLatitude, newLongitude))
                .doesNotThrowAnyException();

        verify(walkTrackRepository).findTopByBookingIdOrderByTimestampDesc(bookingId);
    }

    @Test
    @DisplayName("위치 변화 검증 실패 - 비현실적인 이동 속도")
    void validateLocationChange_UnrealisticSpeed() {
        // Given
        Long bookingId = 1L;
        Double newLatitude = 37.6665; // 매우 먼 거리 (약 11km)
        Double newLongitude = 127.0780;

        WalkingTrack recentTrack = WalkingTrack.builder()
                .bookingId(1L)
                .latitude(37.5665)
                .longitude(126.9780)
                .timestamp(LocalDateTime.now().minusSeconds(10)) // 10초 전
                .build();

        when(walkTrackRepository.findTopByBookingIdOrderByTimestampDesc(bookingId))
                .thenReturn(Optional.of(recentTrack));

        // When & Then
        assertThatThrownBy(() -> locationValidationService.validateLocationChange(bookingId, newLatitude, newLongitude))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNREALISTIC_LOCATION_CHANGE)
                .hasMessageContaining("이동 속도가 너무 빠릅니다");

        verify(walkTrackRepository).findTopByBookingIdOrderByTimestampDesc(bookingId);
    }

    @Test
    @DisplayName("위치 변화 검증 - 시간 차이가 0인 경우")
    void validateLocationChange_ZeroTimeDifference() {
        // Given
        Long bookingId = 1L;
        Double newLatitude = 37.6665;
        Double newLongitude = 127.0780;

        WalkingTrack futureTrack = WalkingTrack.builder()
                .bookingId(1L)
                .latitude(37.5665)
                .longitude(126.9780)
                .timestamp(LocalDateTime.now().plusSeconds(10)) // 미래 시간
                .build();

        when(walkTrackRepository.findTopByBookingIdOrderByTimestampDesc(bookingId))
                .thenReturn(Optional.of(futureTrack));

        // When & Then
        assertThatCode(() -> locationValidationService.validateLocationChange(bookingId, newLatitude, newLongitude))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("위치 정보 필수 체크 성공")
    void requireLocation_Success() {
        // Given
        Double latitude = 37.5665;
        Double longitude = 126.9780;
        String context = "산책 시작";

        // When & Then
        assertThatCode(() -> locationValidationService.requireLocation(latitude, longitude, context))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("위치 정보 필수 체크 실패 - null 위치")
    void requireLocation_NullLocation() {
        // Given
        Double latitude = null;
        Double longitude = 126.9780;
        String context = "산책 시작";

        // When & Then
        assertThatThrownBy(() -> locationValidationService.requireLocation(latitude, longitude, context))
                .isInstanceOf(LocationRequiredException.class)
                .hasMessageContaining("산책 시작을(를) 위해 위치 정보가 필요합니다");
    }

    @Test
    @DisplayName("가짜 위치 감지 - 데이터 부족")
    void isProbablyFakeLocation_InsufficientData() {
        // Given
        Long bookingId = 1L;
        Double latitude = 37.5665;
        Double longitude = 126.9780;

        when(walkTrackRepository.findTop5ByBookingIdOrderByTimestampDesc(bookingId))
                .thenReturn(Arrays.asList(
                        createTrack(1L, 37.5665, 126.9780),
                        createTrack(2L, 37.5665, 126.9780)
                )); // 2개만 반환

        // When
        boolean result = locationValidationService.isProbablyFakeLocation(bookingId, latitude, longitude);

        // Then
        assertThat(result).isFalse();

        verify(walkTrackRepository).findTop5ByBookingIdOrderByTimestampDesc(bookingId);
    }

    @Test
    @DisplayName("가짜 위치 감지 - 동일 좌표 반복")
    void isProbablyFakeLocation_SameCoordinates() {
        // Given
        Long bookingId = 1L;
        Double latitude = 37.5665;
        Double longitude = 126.9780;

        when(walkTrackRepository.findTop5ByBookingIdOrderByTimestampDesc(bookingId))
                .thenReturn(recentTracks);

        // When
        boolean result = locationValidationService.isProbablyFakeLocation(bookingId, latitude, longitude);

        // Then
        assertThat(result).isTrue();

        verify(walkTrackRepository).findTop5ByBookingIdOrderByTimestampDesc(bookingId);
    }

    @Test
    @DisplayName("가짜 위치 감지 - 정상적인 위치 변화")
    void isProbablyFakeLocation_NormalVariation() {
        // Given
        Long bookingId = 1L;
        Double latitude = 37.5665;
        Double longitude = 126.9780;

        List<WalkingTrack> variableTracks = Arrays.asList(
                createTrack(1L, 37.5665, 126.9780),
                createTrack(2L, 37.5666, 126.9781), // 다른 좌표
                createTrack(3L, 37.5665, 126.9780),
                createTrack(4L, 37.5665, 126.9780),
                createTrack(5L, 37.5665, 126.9780)
        );

        when(walkTrackRepository.findTop5ByBookingIdOrderByTimestampDesc(bookingId))
                .thenReturn(variableTracks);

        // When
        boolean result = locationValidationService.isProbablyFakeLocation(bookingId, latitude, longitude);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("가짜 위치 감지 - 미세한 좌표 차이 (허용 범위 내)")
    void isProbablyFakeLocation_MinorDifference() {
        // Given
        Long bookingId = 1L;
        Double latitude = 37.56650001; // 매우 작은 차이
        Double longitude = 126.97800001;

        when(walkTrackRepository.findTop5ByBookingIdOrderByTimestampDesc(bookingId))
                .thenReturn(recentTracks);

        // When
        boolean result = locationValidationService.isProbablyFakeLocation(bookingId, latitude, longitude);

        // Then
        assertThat(result).isTrue(); // 허용 범위 내에서 동일하다고 판단

        verify(walkTrackRepository).findTop5ByBookingIdOrderByTimestampDesc(bookingId);
    }

    @Test
    @DisplayName("빈 추적 리스트로 가짜 위치 감지")
    void isProbablyFakeLocation_EmptyList() {
        // Given
        Long bookingId = 1L;
        Double latitude = 37.5665;
        Double longitude = 126.9780;

        when(walkTrackRepository.findTop5ByBookingIdOrderByTimestampDesc(bookingId))
                .thenReturn(Collections.emptyList());

        // When
        boolean result = locationValidationService.isProbablyFakeLocation(bookingId, latitude, longitude);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("위치 검증 - 다양한 한국 도시 좌표")
    void validateCoordinates_KoreanCities() {
        // When & Then
        // 서울
        assertThatCode(() -> locationValidationService.validateKoreaCoordinates(37.5665, 126.9780))
                .doesNotThrowAnyException();

        // 부산
        assertThatCode(() -> locationValidationService.validateKoreaCoordinates(35.1796, 129.0756))
                .doesNotThrowAnyException();

        // 제주도
        assertThatCode(() -> locationValidationService.validateKoreaCoordinates(33.4996, 126.5312))
                .doesNotThrowAnyException();

        // 독도 (한국 최동단)
        assertThatCode(() -> locationValidationService.validateKoreaCoordinates(37.2424, 131.8642))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("속도 계산 정확성 테스트")
    void validateLocationChange_SpeedCalculationAccuracy() {
        // Given
        Long bookingId = 1L;

        // 1분 전 위치 (서울역)
        WalkingTrack baseTrack = WalkingTrack.builder()
                .bookingId(1L)
                .latitude(37.5547)
                .longitude(126.9707)
                .timestamp(LocalDateTime.now().minusMinutes(1))
                .build();

        // 현재 위치 (강남역) - 약 15km 거리
        Double newLatitude = 37.4979;
        Double newLongitude = 127.0276;

        when(walkTrackRepository.findTopByBookingIdOrderByTimestampDesc(bookingId))
                .thenReturn(Optional.of(baseTrack));

        // When & Then
        // 1분에 15km 이동은 시속 900km/h로 비현실적이므로 예외 발생
        assertThatThrownBy(() -> locationValidationService.validateLocationChange(bookingId, newLatitude, newLongitude))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNREALISTIC_LOCATION_CHANGE);
    }

    private WalkingTrack createTrack(Long id, Double latitude, Double longitude) {
        return WalkingTrack.builder()
                .bookingId(1L)
                .latitude(latitude)
                .longitude(longitude)
                .timestamp(LocalDateTime.now().minusMinutes(id))
                .trackType(WalkingTrack.TrackType.WALKING)
                .build();
    }
}