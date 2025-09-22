package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.walker.dto.walkerBooking.LocationUpdateRequest;
import com.petmily.backend.api.walker.dto.walkerBooking.PhotoUploadRequest;
import com.petmily.backend.api.walker.dto.walkerBooking.WalkerBookingRequest;
import com.petmily.backend.api.walker.dto.walkerBooking.WalkerBookingResponse;
import com.petmily.backend.api.walker.dto.WalkerStatus;
import com.petmily.backend.domain.user.entity.Role;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walker.repository.WalkerBookingRepository;
import com.petmily.backend.domain.walker.repository.WalkerProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalkerBookingServiceTest {

    @Mock
    private WalkerBookingRepository walkerBookingRepository;

    @Mock
    private WalkerProfileRepository walkerProfileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WalkerBookingService walkerBookingService;

    private User mockUser;
    private User mockWalkerUser;
    private WalkerProfile mockWalkerProfile;
    private WalkerBooking mockBooking;
    private WalkerBookingRequest mockBookingRequest;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .username("testuser")
                .name("테스트 사용자")
                .email("test@example.com")
                .role(Role.USER)
                .build();

        mockWalkerUser = User.builder()
                .id(2L)
                .username("walker1")
                .name("김워커")
                .email("walker@example.com")
                .role(Role.USER)
                .build();

        mockWalkerProfile = WalkerProfile.builder()
                .id(1L)
                .userId(2L)
                .location("강남구")
                .rating(4.8)
                .hourlyRate(30000.0)
                .isAvailable(true)
                .status(WalkerStatus.ACTIVE)
                .user(mockWalkerUser)
                .build();

        mockBooking = new WalkerBooking();
        mockBooking.setId(1L);
        mockBooking.setUserId(1L);
        mockBooking.setWalkerId(1L);
        mockBooking.setPetId(1L);
        mockBooking.setDate(LocalDateTime.now().plusDays(1));
        mockBooking.setDuration(60);
        mockBooking.setTotalPrice(30000.0);
        mockBooking.setStatus(WalkerBooking.BookingStatus.PENDING);
        mockBooking.setNotes("테스트 산책 요청");

        mockBookingRequest = new WalkerBookingRequest();
        mockBookingRequest.setWalkerId(1L);
        mockBookingRequest.setPetId(1L);
        mockBookingRequest.setDate(LocalDateTime.now().plusDays(1));
        mockBookingRequest.setDuration(60);
        mockBookingRequest.setNotes("테스트 산책 요청");
    }

    @Test
    void createBooking_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(walkerProfileRepository.findById(1L)).thenReturn(Optional.of(mockWalkerProfile));
        when(walkerBookingRepository.save(any(WalkerBooking.class))).thenReturn(mockBooking);

        // When
        WalkerBookingResponse result = walkerBookingService.createBooking(1L, mockBookingRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(WalkerBooking.BookingStatus.PENDING);
        assertThat(result.getTotalPrice()).isEqualTo(30000.0);
        verify(walkerBookingRepository).save(any(WalkerBooking.class));
    }

    @Test
    void createBooking_UserNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> walkerBookingService.createBooking(1L, mockBookingRequest))
                .isInstanceOf(CustomException.class);
    }

    @Test
    void createBooking_WalkerNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(walkerProfileRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> walkerBookingService.createBooking(1L, mockBookingRequest))
                .isInstanceOf(CustomException.class);
    }

    @Test
    void createBooking_WalkerNotAvailable() {
        // Given
        WalkerProfile unavailableWalker = WalkerProfile.builder()
                .id(1L)
                .userId(2L)
                .isAvailable(false)  // 사용불가 상태
                .status(WalkerStatus.ACTIVE)
                .user(mockWalkerUser)
                .build();
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(walkerProfileRepository.findById(1L)).thenReturn(Optional.of(unavailableWalker));

        // When & Then
        assertThatThrownBy(() -> walkerBookingService.createBooking(1L, mockBookingRequest))
                .isInstanceOf(CustomException.class);
    }

    @Test
    void getUserBookings_Success() {
        // Given
        when(walkerBookingRepository.findByUserIdOrderByDateDesc(1L))
                .thenReturn(Arrays.asList(mockBooking));

        // When
        List<WalkerBookingResponse> result = walkerBookingService.getUserBookings(1L);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(WalkerBooking.BookingStatus.PENDING);
    }

    @Test
    void getWalkerBookings_Success() {
        // Given
        when(walkerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(mockWalkerProfile));
        when(walkerBookingRepository.findByWalkerIdOrderByDateDesc(1L))
                .thenReturn(Arrays.asList(mockBooking));

        // When
        List<WalkerBookingResponse> result = walkerBookingService.getWalkerBookings(1L);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getWalkerId()).isEqualTo(1L);
    }

    @Test
    void confirmBooking_Success() {
        // Given
        when(userRepository.findByUsername("walker1")).thenReturn(Optional.of(mockWalkerUser));
        when(walkerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(mockWalkerProfile));
        when(walkerBookingRepository.findById(1L)).thenReturn(Optional.of(mockBooking));
        when(walkerBookingRepository.save(any(WalkerBooking.class))).thenReturn(mockBooking);

        // When
        WalkerBookingResponse result = walkerBookingService.confirmBooking(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        verify(walkerBookingRepository).save(any(WalkerBooking.class));
    }

    @Test
    void confirmBooking_NotWalkerOwner() {
        // Given
        User otherWalker = User.builder().id(3L).username("otherwalker").build();
        when(userRepository.findByUsername("otherwalker")).thenReturn(Optional.of(otherWalker));
        when(walkerProfileRepository.findByUserId(3L)).thenReturn(Optional.empty());
        when(walkerBookingRepository.findById(1L)).thenReturn(Optional.of(mockBooking));

        // When & Then
        assertThatThrownBy(() -> walkerBookingService.confirmBooking(1L, 2L))
                .isInstanceOf(CustomException.class);
    }


    @Test
    void cancelBooking_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(walkerBookingRepository.findById(1L)).thenReturn(Optional.of(mockBooking));
        when(walkerBookingRepository.save(any(WalkerBooking.class))).thenReturn(mockBooking);

        // When
        WalkerBookingResponse result = walkerBookingService.cancelBooking(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        verify(walkerBookingRepository).save(any(WalkerBooking.class));
    }

    @Test
    void cancelBooking_NotBookingOwner() {
        // Given
        User otherUser = User.builder().id(3L).username("otheruser").build();
        WalkerBooking otherUserBooking = new WalkerBooking();
        otherUserBooking.setId(1L);
        otherUserBooking.setUserId(3L); // 다른 사용자의 예약

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(walkerBookingRepository.findById(1L)).thenReturn(Optional.of(otherUserBooking));

        // When & Then
        assertThatThrownBy(() -> walkerBookingService.cancelBooking(1L, 1L))
                .isInstanceOf(CustomException.class);
    }

}