package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.map.dto.Coord;
import com.petmily.backend.api.map.service.KakaoMapService;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileCreateRequest;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileResponse;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerSearchRequest;
import com.petmily.backend.api.walker.dto.WalkerStatus;
import com.petmily.backend.domain.user.entity.Address;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walker.repository.WalkerProfileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalkerServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private WalkerProfileRepository walkerProfileRepository;
    @Mock
    private KakaoMapService kakaoMapService;
    @Mock
    private SecurityContext securityContext;
    @Mock
    private Authentication authentication;

    @InjectMocks
    private WalkerService walkerService;


    @Test
    @DisplayName("워커 등록 성공")
    void registerWalker_success() {
        // Given
        String username = "testuser";
        WalkerProfileCreateRequest request = new WalkerProfileCreateRequest();
        request.setBio("I love dogs");
        request.setExperience("5 years");
        request.setServiceArea("Seoul");

        // Create user as a Mockito mock
        User user = mock(User.class);
        when(user.getId()).thenReturn(1L);
        when(user.getUsername()).thenReturn(username);

        WalkerProfile newWalkerProfile = WalkerProfile.builder()
                .id(1L)
                .userId(1L)
                .bio("I love dogs")
                .experience("5 years")
                .status(WalkerStatus.PENDING)
                .location("Seoul")
                .user(user) // Set user for response mapping
                .build();

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(walkerProfileRepository.findByUserId(user.getId())).thenReturn(Optional.empty());
        when(walkerProfileRepository.save(any(WalkerProfile.class))).thenReturn(newWalkerProfile);

        // When
        WalkerProfileResponse response = walkerService.registerWalker(username, request);

        // Then
        assertNotNull(response);
        assertEquals(username, response.getUsername());
        assertEquals(WalkerStatus.PENDING, response.getStatus());
        verify(userRepository, times(1)).findByUsername(username);
        verify(walkerProfileRepository, times(1)).findByUserId(user.getId());
        verify(walkerProfileRepository, times(1)).save(any(WalkerProfile.class));
    }

    @Test
    @DisplayName("모든 워커 조회 성공 - 사용자 주소 기반 필터링")
    void getAllWalkers_success_location_filtered() {
        // Given
        String username = "userWithAddress";
        String userRoadAddress = "서울시 강남구 테헤란로 123";
        User currentUser = User.builder()
                .username(username)
                .address(Address.builder().roadAddress(userRoadAddress).build())
                .build();

        // Mock authenticated user
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(username);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(currentUser));

        // Mock KakaoMapService geocoding
        when(kakaoMapService.geocodeAddress(userRoadAddress)).thenReturn(new Coord(37.5000, 127.0000)); // User's coordinates

        // Mock Walker Profiles
        WalkerProfile walker1 = WalkerProfile.builder()
                .id(1L).userId(101L).location("37.5001,127.0001").status(WalkerStatus.ACTIVE)
                .user(User.builder().username("walker1").build())
                .build(); // Within 30km
        WalkerProfile walker2 = WalkerProfile.builder()
                .id(2L).userId(102L).location("37.8000,127.5000").status(WalkerStatus.ACTIVE)
                .user(User.builder().username("walker2").build())
                .build(); // Outside 30km
        WalkerProfile walker3 = WalkerProfile.builder()
                .id(3L).userId(103L).location("37.5002,127.0002").status(WalkerStatus.PENDING)
                .user(User.builder().username("walker3").build())
                .build(); // Within 30km, but PENDING status (should still be returned by filter)

        when(walkerProfileRepository.findAll()).thenReturn(Arrays.asList(walker1, walker2, walker3));

        // When
        List<WalkerProfileResponse> response = walkerService.getAllWalkers(new WalkerSearchRequest());

        // Then
        assertNotNull(response);
        // Based on the coordinates, walker1 and walker3 should be within 30km. walker2 should be outside.
        // The distance calculation is approximate for testing, actual values depend on Haversine.
        // For this test, let's assume walker1 and walker3 are close enough.
        assertEquals(2, response.size()); // Expect 2 walkers within range
        assertTrue(response.stream().anyMatch(w -> w.getUsername().equals("walker1")));
        assertTrue(response.stream().anyMatch(w -> w.getUsername().equals("walker3")));
        assertFalse(response.stream().anyMatch(w -> w.getUsername().equals("walker2")));

        verify(userRepository, times(1)).findByUsername(username);
        verify(kakaoMapService, times(1)).geocodeAddress(userRoadAddress);
        verify(walkerProfileRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("모든 워커 조회 실패 - 사용자 주소 없음")
    void getAllWalkers_fail_user_address_not_found() {
        // Given
        String username = "userWithoutAddress";
        User currentUser = User.builder().username(username).address(null).build(); // User with no address

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(username);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(currentUser));

        // When & Then
        CustomException exception = assertThrows(CustomException.class, () -> walkerService.getAllWalkers(new WalkerSearchRequest()));
        assertEquals(ErrorCode.INVALID_REQUEST, exception.getErrorCode());
        assertEquals("User address not found for location-based search.", exception.getMessage());

        verify(userRepository, times(1)).findByUsername(username);
        verify(kakaoMapService, never()).geocodeAddress(anyString()); // Geocoding should not be called
        verify(walkerProfileRepository, never()).findAll();
    }

    @Test
    @DisplayName("모든 워커 조회 실패 - 워커 위치 정보 형식 오류")
    void getAllWalkers_fail_walker_location_malformed() {
        // Given
        String username = "userWithAddress";
        String userRoadAddress = "서울시 강남구 테헤란로 123";
        User currentUser = User.builder()
                .username(username)
                .address(Address.builder().roadAddress(userRoadAddress).build())
                .build();

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(username);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(currentUser));
        when(kakaoMapService.geocodeAddress(userRoadAddress)).thenReturn(new Coord(37.5000, 127.0000));

        // Mock Walker Profiles with malformed location
        WalkerProfile walker1 = WalkerProfile.builder()
                .id(1L).userId(101L).location("malformed_location").status(WalkerStatus.ACTIVE)
                .user(User.builder().username("walker1").build())
                .build();
        when(walkerProfileRepository.findAll()).thenReturn(Arrays.asList(walker1));

        // When
        List<WalkerProfileResponse> response = walkerService.getAllWalkers(new WalkerSearchRequest());

        // Then
        assertNotNull(response);
        assertTrue(response.isEmpty()); // Malformed location should be filtered out

        verify(userRepository, times(1)).findByUsername(username);
        verify(kakaoMapService, times(1)).geocodeAddress(userRoadAddress);
        verify(walkerProfileRepository, times(1)).findAll();
    }
}
