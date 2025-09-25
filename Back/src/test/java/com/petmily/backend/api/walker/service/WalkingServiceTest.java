package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.walker.dto.walkerBooking.WalkerBookingResponse;
import com.petmily.backend.api.walker.dto.walking.*;
import com.petmily.backend.api.walker.service.notification.WalkNotificationService;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walker.entity.WalkingTrack;
import com.petmily.backend.domain.walker.repository.WalkerBookingRepository;
import com.petmily.backend.domain.walker.repository.WalkingTrackRepository;
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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalkingServiceTest {

    @Mock
    private WalkingTrackRepository walkingTrackRepository;

    @Mock
    private WalkerBookingRepository walkerBookingRepository;

    @Mock
    private WalkingValidationService validationService;

    @Mock
    private LocationValidationService locationValidationService;

    @Mock
    private WalkNotificationService notificationService;

    @InjectMocks
    private WalkingService walkingService;

    private User user;
    private User walkerUser;
    private WalkerProfile walker;
    private Pet pet;
    private WalkerBooking confirmedBooking;
    private WalkerBooking inProgressBooking;
    private WalkingValidationService.WalkerBookingValidation walkerValidation;
    private WalkingValidationService.UserBookingValidation userValidation;
    private LocationTrackRequest locationTrackRequest;
    private LocationUpdateRequest locationUpdateRequest;
    private PhotoUploadRequest photoUploadRequest;
    private WalkingTrack walkingTrack;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .name("Test User")
                .phone("010-1234-5678")
                .build();

        walkerUser = User.builder()
                .id(2L)
                .username("walker")
                .email("walker@example.com")
                .name("Walker User")
                .build();

        walker = WalkerProfile.builder()
                .id(1L)
                .userId(2L)
                .bio("Test Walker Bio")
                .hourlyRate(25.0)
                .build();

        pet = Pet.builder()
                .id(1L)
                .name("Buddy")
                .breed("Golden Retriever")
                .age(3)
                .userId(1L)
                .build();

        confirmedBooking = WalkerBooking.builder()
                .id(1L)
                .userId(1L)
                .walkerId(1L)
                .petId(1L)
                .duration(60)
                .status(WalkerBooking.BookingStatus.CONFIRMED)
                .user(user)
                .walker(walker)
                .pet(pet)
                .build();

        inProgressBooking = WalkerBooking.builder()
                .id(2L)
                .userId(1L)
                .walkerId(1L)
                .petId(1L)
                .duration(60)
                .status(WalkerBooking.BookingStatus.IN_PROGRESS)
                .actualStartTime(LocalDateTime.now().minusMinutes(10))
                .user(user)
                .walker(walker)
                .pet(pet)
                .build();

        walkerValidation = new WalkingValidationService.WalkerBookingValidation(
                walkerUser, confirmedBooking, walker);

        userValidation = new WalkingValidationService.UserBookingValidation(
                user, confirmedBooking);

        locationTrackRequest = LocationTrackRequest.builder()
                .latitude(37.5665)
                .longitude(126.9780)
                .timestamp(LocalDateTime.now())
                .accuracy(10.0)
                .trackType(WalkingTrack.TrackType.WALKING)
                .speed(5.0)
                .altitude(50.0)
                .build();

        locationUpdateRequest = LocationUpdateRequest.builder()
                .latitude(37.5665)
                .longitude(126.9780)
                .address("Seoul, Korea")
                .build();

        photoUploadRequest = PhotoUploadRequest.builder()
                .photoUrl("http://example.com/photo.jpg")
                .photoType("START")
                .location("Seoul Station")
                .build();

        walkingTrack = WalkingTrack.builder()
                .id(1L)
                .bookingId(1L)
                .latitude(37.5665)
                .longitude(126.9780)
                .timestamp(LocalDateTime.now())
                .accuracy(10.0)
                .trackType(WalkingTrack.TrackType.WALKING)
                .speed(5.0)
                .altitude(50.0)
                .build();
    }

    @Test
    @DisplayName("산책 시작 성공")
    void startWalk_Success() {
        // Given
        String username = "walker";
        when(validationService.validateWalkerBooking(1L, username)).thenReturn(walkerValidation);
        when(walkerBookingRepository.save(any(WalkerBooking.class))).thenReturn(confirmedBooking);

        // When
        WalkerBookingResponse result = walkingService.startWalk(1L, username);

        // Then
        assertThat(result).isNotNull();

        verify(validationService).validateWalkerBooking(1L, username);
        verify(walkerBookingRepository).save(any(WalkerBooking.class));
        verify(notificationService).sendWalkStartNotification(any(WalkerBooking.class), eq("Buddy"), eq("010-1234-5678"));
    }

    @Test
    @DisplayName("산책 시작 실패 - 잘못된 상태")
    void startWalk_InvalidStatus() {
        // Given
        String username = "walker";
        WalkerBooking inProgressBookingForValidation = WalkerBooking.builder()
                .status(WalkerBooking.BookingStatus.IN_PROGRESS)
                .build();
        WalkingValidationService.WalkerBookingValidation validation =
                new WalkingValidationService.WalkerBookingValidation(walkerUser, inProgressBookingForValidation, walker);

        when(validationService.validateWalkerBooking(1L, username)).thenReturn(validation);

        // When & Then
        assertThatThrownBy(() -> walkingService.startWalk(1L, username))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_REQUEST)
                .hasMessageContaining("Can only start confirmed bookings");

        verify(validationService).validateWalkerBooking(1L, username);
        verify(walkerBookingRepository, never()).save(any());
        verify(notificationService, never()).sendWalkStartNotification(any(), any(), any());
    }

    @Test
    @DisplayName("산책 시작 성공 - 알림 발송 실패 시에도 계속 진행")
    void startWalk_NotificationFailure() {
        // Given
        String username = "walker";
        when(validationService.validateWalkerBooking(1L, username)).thenReturn(walkerValidation);
        when(walkerBookingRepository.save(any(WalkerBooking.class))).thenReturn(confirmedBooking);
        doThrow(new RuntimeException("Notification error"))
                .when(notificationService).sendWalkStartNotification(any(), any(), any());

        // When
        WalkerBookingResponse result = walkingService.startWalk(1L, username);

        // Then
        assertThat(result).isNotNull();
        verify(walkerBookingRepository).save(confirmedBooking);
    }

    @Test
    @DisplayName("산책 완료 성공")
    void completeWalk_Success() {
        // Given
        String username = "walker";
        WalkingValidationService.WalkerBookingValidation validation =
                new WalkingValidationService.WalkerBookingValidation(walkerUser, inProgressBooking, walker);

        when(validationService.validateWalkerBooking(2L, username)).thenReturn(validation);
        when(walkerBookingRepository.save(any(WalkerBooking.class))).thenReturn(inProgressBooking);

        // When
        WalkerBookingResponse result = walkingService.completeWalk(2L, username);

        // Then
        assertThat(result).isNotNull();

        verify(validationService).validateWalkerBooking(2L, username);
        verify(walkerBookingRepository).save(any(WalkerBooking.class));
        verify(notificationService).sendWalkCompleteNotification(any(WalkerBooking.class), eq("Buddy"), eq("010-1234-5678"));
    }

    @Test
    @DisplayName("산책 완료 실패 - 잘못된 상태")
    void completeWalk_InvalidStatus() {
        // Given
        String username = "walker";
        when(validationService.validateWalkerBooking(1L, username)).thenReturn(walkerValidation);

        // When & Then
        assertThatThrownBy(() -> walkingService.completeWalk(1L, username))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_REQUEST)
                .hasMessageContaining("Can only complete walks in progress");

        verify(validationService).validateWalkerBooking(1L, username);
        verify(walkerBookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("산책 완료 성공 - 시작 시간이 없을 때 자동 설정")
    void completeWalk_WithoutStartTime() {
        // Given
        String username = "walker";
        WalkerBooking bookingWithoutStartTime = WalkerBooking.builder()
                .id(2L)
                .userId(1L)
                .walkerId(1L)
                .duration(60)
                .status(WalkerBooking.BookingStatus.IN_PROGRESS)
                .actualStartTime(null)
                .user(user)
                .pet(pet)
                .build();

        WalkingValidationService.WalkerBookingValidation validation =
                new WalkingValidationService.WalkerBookingValidation(walkerUser, bookingWithoutStartTime, walker);

        when(validationService.validateWalkerBooking(2L, username)).thenReturn(validation);
        when(walkerBookingRepository.save(any(WalkerBooking.class))).thenReturn(bookingWithoutStartTime);

        // When
        WalkerBookingResponse result = walkingService.completeWalk(2L, username);

        // Then
        assertThat(result).isNotNull();
        verify(walkerBookingRepository).save(any(WalkerBooking.class));
    }

    @Test
    @DisplayName("산책 경로 추적 저장 성공")
    void saveWalkingTrack_Success() {
        // Given
        Long bookingId = 2L;
        String username = "walker";
        WalkingValidationService.WalkerBookingValidation validation =
                new WalkingValidationService.WalkerBookingValidation(walkerUser, inProgressBooking, walker);

        when(validationService.validateWalkerBooking(bookingId, username)).thenReturn(validation);
        when(walkingTrackRepository.save(any(WalkingTrack.class))).thenReturn(walkingTrack);

        // When
        WalkingTrackResponse result = walkingService.saveWalkingTrack(bookingId, locationTrackRequest, username);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getLatitude()).isEqualTo(37.5665);
        assertThat(result.getLongitude()).isEqualTo(126.9780);

        verify(validationService).validateWalkerBooking(bookingId, username);
        verify(locationValidationService).requireLocation(37.5665, 126.9780, "위치 추적");
        verify(locationValidationService).validateLocationChange(bookingId, 37.5665, 126.9780);
        verify(locationValidationService).isProbablyFakeLocation(bookingId, 37.5665, 126.9780);
        verify(walkingTrackRepository).save(argThat(track ->
                track.getBookingId().equals(bookingId) &&
                track.getLatitude().equals(37.5665) &&
                track.getLongitude().equals(126.9780) &&
                track.getTrackType().equals(WalkingTrack.TrackType.WALKING)
        ));
    }

    @Test
    @DisplayName("산책 경로 추적 저장 실패 - 잘못된 상태")
    void saveWalkingTrack_InvalidStatus() {
        // Given
        Long bookingId = 1L;
        String username = "walker";

        when(validationService.validateWalkerBooking(bookingId, username)).thenReturn(walkerValidation);

        // When & Then
        assertThatThrownBy(() -> walkingService.saveWalkingTrack(bookingId, locationTrackRequest, username))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_REQUEST)
                .hasMessageContaining("Can only track location during active walk");

        verify(validationService).validateWalkerBooking(bookingId, username);
        verify(walkingTrackRepository, never()).save(any());
    }

    @Test
    @DisplayName("산책 경로 추적 저장 - 의심스러운 위치 패턴 감지")
    void saveWalkingTrack_SuspiciousLocation() {
        // Given
        Long bookingId = 2L;
        String username = "walker";
        WalkingValidationService.WalkerBookingValidation validation =
                new WalkingValidationService.WalkerBookingValidation(walkerUser, inProgressBooking, walker);

        when(validationService.validateWalkerBooking(bookingId, username)).thenReturn(validation);
        when(locationValidationService.isProbablyFakeLocation(bookingId, 37.5665, 126.9780)).thenReturn(true);
        when(walkingTrackRepository.save(any(WalkingTrack.class))).thenReturn(walkingTrack);

        // When
        WalkingTrackResponse result = walkingService.saveWalkingTrack(bookingId, locationTrackRequest, username);

        // Then
        assertThat(result).isNotNull();
        verify(locationValidationService).isProbablyFakeLocation(bookingId, 37.5665, 126.9780);
        verify(walkingTrackRepository).save(any(WalkingTrack.class));
    }

    @Test
    @DisplayName("산책 경로 조회 성공")
    void getWalkingPath_Success() {
        // Given
        Long bookingId = 1L;
        String username = "testuser";
        List<WalkingTrack> tracks = Arrays.asList(
                createWalkingTrack(1L, 37.5665, 126.9780, LocalDateTime.now().minusMinutes(30)),
                createWalkingTrack(2L, 37.5666, 126.9781, LocalDateTime.now().minusMinutes(29)),
                createWalkingTrack(3L, 37.5667, 126.9782, LocalDateTime.now().minusMinutes(28))
        );

        when(validationService.validateUserBooking(bookingId, username)).thenReturn(userValidation);
        when(walkingTrackRepository.findByBookingIdOrderByTimestampAsc(bookingId)).thenReturn(tracks);

        // When
        WalkingPathResponse result = walkingService.getWalkingPath(bookingId, username);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getBookingId()).isEqualTo(bookingId);
        assertThat(result.getTrackPoints()).hasSize(3);
        assertThat(result.getStatistics()).isNotNull();
        assertThat(result.getStatistics().getTotalPoints()).isEqualTo(3);
        assertThat(result.getStatistics().getTotalDistance()).isPositive();

        verify(validationService).validateUserBooking(bookingId, username);
        verify(walkingTrackRepository).findByBookingIdOrderByTimestampAsc(bookingId);
    }

    @Test
    @DisplayName("산책 경로 조회 - 빈 결과")
    void getWalkingPath_EmptyTracks() {
        // Given
        Long bookingId = 1L;
        String username = "testuser";

        when(validationService.validateUserBooking(bookingId, username)).thenReturn(userValidation);
        when(walkingTrackRepository.findByBookingIdOrderByTimestampAsc(bookingId)).thenReturn(Collections.emptyList());

        // When
        WalkingPathResponse result = walkingService.getWalkingPath(bookingId, username);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTrackPoints()).isEmpty();
        assertThat(result.getStatistics().getTotalDistance()).isEqualTo(0.0);
        assertThat(result.getStatistics().getTotalDuration()).isEqualTo(0L);
        assertThat(result.getStatistics().getWalkingRoute()).isEqualTo("산책 데이터가 없습니다");
    }

    @Test
    @DisplayName("실시간 위치 조회 성공")
    void getRealtimeLocation_Success() {
        // Given
        Long bookingId = 1L;
        LocalDateTime afterTime = LocalDateTime.now().minusMinutes(5);
        String username = "testuser";
        List<WalkingTrack> recentTracks = Arrays.asList(
                createWalkingTrack(1L, 37.5665, 126.9780, LocalDateTime.now().minusMinutes(3)),
                createWalkingTrack(2L, 37.5666, 126.9781, LocalDateTime.now().minusMinutes(2))
        );

        when(validationService.validateUserBooking(bookingId, username)).thenReturn(userValidation);
        when(walkingTrackRepository.findByBookingIdAndTimestampAfter(bookingId, afterTime)).thenReturn(recentTracks);

        // When
        List<WalkingTrackResponse> result = walkingService.getRealtimeLocation(bookingId, afterTime, username);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);

        verify(validationService).validateUserBooking(bookingId, username);
        verify(walkingTrackRepository).findByBookingIdAndTimestampAfter(bookingId, afterTime);
    }

    @Test
    @DisplayName("위치 업데이트 성공")
    void updateLocation_Success() {
        // Given
        Long bookingId = 2L;
        String username = "walker";
        WalkingValidationService.WalkerBookingValidation validation =
                new WalkingValidationService.WalkerBookingValidation(walkerUser, inProgressBooking, walker);

        when(validationService.validateWalkerBooking(bookingId, username)).thenReturn(validation);
        when(walkerBookingRepository.save(any(WalkerBooking.class))).thenReturn(inProgressBooking);

        // When
        WalkerBookingResponse result = walkingService.updateLocation(bookingId, locationUpdateRequest, username);

        // Then
        assertThat(result).isNotNull();

        verify(validationService).validateWalkerBooking(bookingId, username);
        verify(locationValidationService).requireLocation(37.5665, 126.9780, "위치 업데이트");
        verify(locationValidationService).validateLocationChange(bookingId, 37.5665, 126.9780);
        verify(walkerBookingRepository).save(any(WalkerBooking.class));
    }

    @Test
    @DisplayName("사진 업로드 성공 - START")
    void uploadPhoto_Success_Start() {
        // Given
        Long bookingId = 1L;
        String username = "walker";

        when(validationService.validateWalkerBooking(bookingId, username)).thenReturn(walkerValidation);
        when(walkerBookingRepository.save(any(WalkerBooking.class))).thenReturn(confirmedBooking);

        // When
        WalkerBookingResponse result = walkingService.uploadPhoto(bookingId, photoUploadRequest, username);

        // Then
        assertThat(result).isNotNull();

        verify(validationService).validateWalkerBooking(bookingId, username);
        verify(walkerBookingRepository).save(any(WalkerBooking.class));
    }

    @Test
    @DisplayName("사진 업로드 성공 - MIDDLE")
    void uploadPhoto_Success_Middle() {
        // Given
        Long bookingId = 1L;
        String username = "walker";
        PhotoUploadRequest middlePhotoRequest = PhotoUploadRequest.builder()
                .photoUrl("http://example.com/middle.jpg")
                .photoType("MIDDLE")
                .build();

        when(validationService.validateWalkerBooking(bookingId, username)).thenReturn(walkerValidation);
        when(walkerBookingRepository.save(any(WalkerBooking.class))).thenReturn(confirmedBooking);

        // When
        WalkerBookingResponse result = walkingService.uploadPhoto(bookingId, middlePhotoRequest, username);

        // Then
        assertThat(result).isNotNull();

        verify(walkerBookingRepository).save(any(WalkerBooking.class));
    }

    @Test
    @DisplayName("사진 업로드 성공 - END")
    void uploadPhoto_Success_End() {
        // Given
        Long bookingId = 1L;
        String username = "walker";
        PhotoUploadRequest endPhotoRequest = PhotoUploadRequest.builder()
                .photoUrl("http://example.com/end.jpg")
                .photoType("END")
                .location("Gangnam Station")
                .build();

        when(validationService.validateWalkerBooking(bookingId, username)).thenReturn(walkerValidation);
        when(walkerBookingRepository.save(any(WalkerBooking.class))).thenReturn(confirmedBooking);

        // When
        WalkerBookingResponse result = walkingService.uploadPhoto(bookingId, endPhotoRequest, username);

        // Then
        assertThat(result).isNotNull();

        verify(walkerBookingRepository).save(any(WalkerBooking.class));
    }

    @Test
    @DisplayName("사진 업로드 실패 - 잘못된 타입")
    void uploadPhoto_InvalidType() {
        // Given
        Long bookingId = 1L;
        String username = "walker";
        PhotoUploadRequest invalidRequest = PhotoUploadRequest.builder()
                .photoUrl("http://example.com/photo.jpg")
                .photoType("INVALID")
                .build();

        when(validationService.validateWalkerBooking(bookingId, username)).thenReturn(walkerValidation);

        // When & Then
        assertThatThrownBy(() -> walkingService.uploadPhoto(bookingId, invalidRequest, username))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_REQUEST)
                .hasMessageContaining("Invalid photo type. Must be START, MIDDLE, or END");

        verify(walkerBookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("산책 통계 계산 - 거리 및 속도 계산")
    void calculateWalkingStatistics_WithMultipleTracks() {
        // Given
        Long bookingId = 1L;
        String username = "testuser";
        List<WalkingTrack> tracks = Arrays.asList(
                createWalkingTrackWithSpeed(1L, 37.5665, 126.9780, LocalDateTime.now().minusMinutes(30), 3.0),
                createWalkingTrackWithSpeed(2L, 37.5666, 126.9781, LocalDateTime.now().minusMinutes(29), 5.0),
                createWalkingTrackWithSpeed(3L, 37.5667, 126.9782, LocalDateTime.now().minusMinutes(28), 4.0)
        );

        when(validationService.validateUserBooking(bookingId, username)).thenReturn(userValidation);
        when(walkingTrackRepository.findByBookingIdOrderByTimestampAsc(bookingId)).thenReturn(tracks);

        // When
        WalkingPathResponse result = walkingService.getWalkingPath(bookingId, username);

        // Then
        assertThat(result.getStatistics()).isNotNull();
        assertThat(result.getStatistics().getTotalDistance()).isPositive();
        assertThat(result.getStatistics().getTotalDuration()).isEqualTo(2L); // 2 minutes
        assertThat(result.getStatistics().getMaxSpeed()).isEqualTo(5.0);
        assertThat(result.getStatistics().getAverageSpeed()).isPositive();
        assertThat(result.getStatistics().getStartTime()).isNotNull();
        assertThat(result.getStatistics().getEndTime()).isNotNull();
        assertThat(result.getStatistics().getWalkingRoute()).isNotNull();
    }

    private WalkingTrack createWalkingTrack(Long id, double latitude, double longitude, LocalDateTime timestamp) {
        return WalkingTrack.builder()
                .id(id)
                .bookingId(1L)
                .latitude(latitude)
                .longitude(longitude)
                .timestamp(timestamp)
                .accuracy(10.0)
                .trackType(WalkingTrack.TrackType.WALKING)
                .speed(5.0)
                .altitude(50.0)
                .build();
    }

    private WalkingTrack createWalkingTrackWithSpeed(Long id, double latitude, double longitude,
                                                   LocalDateTime timestamp, double speed) {
        return WalkingTrack.builder()
                .id(id)
                .bookingId(1L)
                .latitude(latitude)
                .longitude(longitude)
                .timestamp(timestamp)
                .accuracy(10.0)
                .trackType(WalkingTrack.TrackType.WALKING)
                .speed(speed)
                .altitude(50.0)
                .build();
    }
}