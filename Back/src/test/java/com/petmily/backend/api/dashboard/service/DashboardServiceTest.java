package com.petmily.backend.api.dashboard.service;

import com.petmily.backend.api.dashboard.dto.DashboardResponse;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.pet.repository.PetRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private WalkerBookingRepository walkerBookingRepository;

    @Mock
    private WalkerProfileRepository walkerProfileRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private User mockUser;
    private Pet mockPet1, mockPet2;
    private WalkerBooking mockActiveBooking, mockCompletedBooking;
    private WalkerProfile mockWalker1, mockWalker2;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .username("testuser")
                .name("테스트 사용자")
                .email("test@example.com")
                .role(Role.USER)
                .build();

        // Mock pets
        mockPet1 = new Pet();
        mockPet1.setId(1L);
        mockPet1.setName("코코");
        mockPet1.setSpecies("개");
        mockPet1.setBreed("골든 리트리버");
        mockPet1.setAge(3);
        mockPet1.setSize(Pet.Size.MEDIUM);
        mockPet1.setUserId(1L);

        mockPet2 = new Pet();
        mockPet2.setId(2L);
        mockPet2.setName("냥이");
        mockPet2.setSpecies("고양이");
        mockPet2.setBreed("페르시안");
        mockPet2.setAge(2);
        mockPet2.setSize(Pet.Size.SMALL);
        mockPet2.setUserId(1L);

        // Mock bookings
        mockActiveBooking = new WalkerBooking();
        mockActiveBooking.setId(1L);
        mockActiveBooking.setUserId(1L);
        mockActiveBooking.setWalkerId(1L);
        mockActiveBooking.setPetId(1L);
        mockActiveBooking.setDate(LocalDateTime.now().plusDays(1));
        mockActiveBooking.setStatus(WalkerBooking.BookingStatus.CONFIRMED);
        mockActiveBooking.setTotalPrice(30000.0);

        mockCompletedBooking = new WalkerBooking();
        mockCompletedBooking.setId(2L);
        mockCompletedBooking.setUserId(1L);
        mockCompletedBooking.setWalkerId(1L);
        mockCompletedBooking.setPetId(1L);
        mockCompletedBooking.setStatus(WalkerBooking.BookingStatus.COMPLETED);
        mockCompletedBooking.setTotalPrice(25000.0);

        // Mock walkers
        mockWalker1 = WalkerProfile.builder()
                .id(1L)
                .userId(2L)
                .location("강남구")
                .rating(4.8)
                .totalWalks(150)
                .hourlyRate(25000.0)
                .isAvailable(true)
                .user(User.builder().username("walker1").name("김워커").build())
                .build();

        mockWalker2 = WalkerProfile.builder()
                .id(2L)
                .userId(3L)
                .location("서초구")
                .rating(4.9)
                .totalWalks(200)
                .hourlyRate(30000.0)
                .isAvailable(true)
                .user(User.builder().username("walker2").name("이워커").build())
                .build();
    }

    @Test
    void getDashboard_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(petRepository.findByUserIdOrderByCreateTimeDesc(1L))
                .thenReturn(Arrays.asList(mockPet1, mockPet2));
        when(walkerBookingRepository.findByUserIdAndStatusIn(eq(1L), any()))
                .thenReturn(Arrays.asList(mockActiveBooking));
        when(walkerProfileRepository.findByIsAvailableTrue())
                .thenReturn(Arrays.asList(mockWalker1, mockWalker2));
        when(petRepository.findByUserId(1L))
                .thenReturn(Arrays.asList(mockPet1, mockPet2));
        when(walkerBookingRepository.findByUserIdAndStatus(1L, WalkerBooking.BookingStatus.COMPLETED))
                .thenReturn(Arrays.asList(mockCompletedBooking));

        // When
        DashboardResponse result = dashboardService.getDashboard("testuser");

        // Then
        assertThat(result).isNotNull();
        
        // Pet 검증
        assertThat(result.getMyPets()).hasSize(2);
        assertThat(result.getMyPets().get(0).getName()).isEqualTo("코코");
        assertThat(result.getMyPets().get(1).getName()).isEqualTo("냥이");
        
        // Active bookings 검증
        assertThat(result.getActiveBookings()).hasSize(1);
        assertThat(result.getActiveBookings().get(0).getStatus()).isEqualTo(WalkerBooking.BookingStatus.CONFIRMED);
        
        // Nearby walkers 검증 (최대 5개로 제한)
        assertThat(result.getNearbyWalkers()).hasSize(2);
        assertThat(result.getNearbyWalkers().get(0).getName()).isEqualTo("김워커");
        assertThat(result.getNearbyWalkers().get(1).getName()).isEqualTo("이워커");
        
        // Stats 검증
        assertThat(result.getStats().getTotalPets()).isEqualTo(2);
        assertThat(result.getStats().getUpcomingBookings()).isEqualTo(1);
        assertThat(result.getStats().getCompletedWalks()).isEqualTo(1);
        assertThat(result.getStats().getTotalSpent()).isEqualTo(25000.0);
    }

    @Test
    void getDashboard_UserNotFound() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> dashboardService.getDashboard("testuser"))
                .isInstanceOf(CustomException.class);
    }

    @Test
    void getDashboard_LimitsPetsToThree() {
        // Given
        Pet mockPet3 = new Pet();
        mockPet3.setId(3L);
        mockPet3.setName("멍멍");
        mockPet3.setUserId(1L);

        Pet mockPet4 = new Pet();
        mockPet4.setId(4L);
        mockPet4.setName("야옹");
        mockPet4.setUserId(1L);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(petRepository.findByUserIdOrderByCreateTimeDesc(1L))
                .thenReturn(Arrays.asList(mockPet1, mockPet2, mockPet3, mockPet4));
        when(walkerBookingRepository.findByUserIdAndStatusIn(eq(1L), any()))
                .thenReturn(Arrays.asList());
        when(walkerProfileRepository.findByIsAvailableTrue())
                .thenReturn(Arrays.asList());
        when(petRepository.findByUserId(1L))
                .thenReturn(Arrays.asList(mockPet1, mockPet2, mockPet3, mockPet4));
        when(walkerBookingRepository.findByUserIdAndStatus(eq(1L), any()))
                .thenReturn(Arrays.asList());

        // When
        DashboardResponse result = dashboardService.getDashboard("testuser");

        // Then
        assertThat(result.getMyPets()).hasSize(3); // 최대 3개로 제한됨
        assertThat(result.getStats().getTotalPets()).isEqualTo(4); // 실제 총 개수는 4개
    }

    @Test
    void getDashboard_LimitsWalkersToFive() {
        // Given
        List<WalkerProfile> manyWalkers = Arrays.asList(
                mockWalker1, mockWalker2, mockWalker1, mockWalker2, 
                mockWalker1, mockWalker2, mockWalker1 // 7개
        );

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(petRepository.findByUserIdOrderByCreateTimeDesc(1L))
                .thenReturn(Arrays.asList());
        when(walkerBookingRepository.findByUserIdAndStatusIn(eq(1L), any()))
                .thenReturn(Arrays.asList());
        when(walkerProfileRepository.findByIsAvailableTrue())
                .thenReturn(manyWalkers);
        when(petRepository.findByUserId(1L))
                .thenReturn(Arrays.asList());
        when(walkerBookingRepository.findByUserIdAndStatus(eq(1L), any()))
                .thenReturn(Arrays.asList());

        // When
        DashboardResponse result = dashboardService.getDashboard("testuser");

        // Then
        assertThat(result.getNearbyWalkers()).hasSize(5); // 최대 5개로 제한됨
    }
}