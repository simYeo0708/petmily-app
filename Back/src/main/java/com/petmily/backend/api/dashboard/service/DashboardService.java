package com.petmily.backend.api.dashboard.service;

import com.petmily.backend.api.dashboard.dto.DashboardResponse;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.pet.dto.PetSummaryResponse;
import com.petmily.backend.api.walk.dto.booking.response.WalkBookingResponse;
import com.petmily.backend.api.walker.dto.WalkerSummaryResponse;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.pet.repository.PetRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walk.repository.WalkBookingRepository;
import com.petmily.backend.domain.walker.repository.WalkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final WalkBookingRepository walkBookingRepository;
    private final WalkerRepository walkerRepository;

    private User findUserById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    public DashboardResponse getDashboard(Long userId) {
        User user = findUserById(userId);

        return DashboardResponse.builder()
                .userInfo(buildUserInfo(user))
                .myPets(getMyPets(user.getId()))
                .petStats(buildPetStats(user.getId()))
                .recentBookings(getRecentBookings(user.getId()))
                .upcomingBookings(getUpcomingBookings(user.getId()))
                .walkingStats(buildWalkingStats(user.getId()))
                .recommendedWalkers(getRecommendedWalkers(user.getId()))
                .favoriteWalkers(getFavoriteWalkers(user.getId()))
                .shoppingOverview(buildShoppingOverview(user.getId()))
                .chatOverview(buildChatOverview(user.getId()))
                .overallStats(buildOverallStats(user))
                .build();
    }

    private DashboardResponse.UserInfo buildUserInfo(User user) {
        return DashboardResponse.UserInfo.builder()
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .membershipLevel("일반") // 향후 확장 가능
                .build();
    }

    private List<PetSummaryResponse> getMyPets(Long userId) {
        return petRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .limit(3)
                .map(PetSummaryResponse::from)
                .collect(Collectors.toList());
    }

    private DashboardResponse.PetStats buildPetStats(Long userId) {
        List<Pet> pets = petRepository.findByUserId(userId);
        String mostRecentPetName = pets.isEmpty() ? null :
            pets.stream()
                .max((p1, p2) -> p1.getCreatedAt().compareTo(p2.getCreatedAt()))
                .map(Pet::getName)
                .orElse(null);

        return DashboardResponse.PetStats.builder()
                .totalPets(pets.size())
                .mostRecentPetName(mostRecentPetName)
                .petsNeedingWalk(calculatePetsNeedingWalk(pets))
                .build();
    }

    private int calculatePetsNeedingWalk(List<Pet> pets) {
        // 간단한 로직: 최근 3일 내에 산책하지 않은 펫들
        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);
        return (int) pets.stream()
                .filter(pet -> {
                    List<WalkBooking> recentWalks = walkBookingRepository
                            .findByPetIdAndStatusAndCreatedAtAfter(
                                    pet.getId(),
                                    WalkBooking.BookingStatus.COMPLETED,
                                    threeDaysAgo);
                    return recentWalks.isEmpty();
                })
                .count();
    }

    private List<WalkBookingResponse> getRecentBookings(Long userId) {
        return walkBookingRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, WalkBooking.BookingStatus.COMPLETED)
                .stream()
                .limit(3)
                .map(WalkBookingResponse::from)
                .collect(Collectors.toList());
    }

    private List<WalkBookingResponse> getUpcomingBookings(Long userId) {
        return walkBookingRepository
                .findByUserIdAndStatusInOrderByDateAsc(userId,
                        List.of(WalkBooking.BookingStatus.PENDING,
                               WalkBooking.BookingStatus.CONFIRMED))
                .stream()
                .limit(5)
                .map(WalkBookingResponse::from)
                .collect(Collectors.toList());
    }

    private DashboardResponse.WalkingStats buildWalkingStats(Long userId) {
        List<WalkBooking> completedWalks = walkBookingRepository
                .findByUserIdAndStatus(userId, WalkBooking.BookingStatus.COMPLETED);

        List<WalkBooking> upcomingWalks = walkBookingRepository
                .findByUserIdAndStatusIn(userId,
                        List.of(WalkBooking.BookingStatus.PENDING,
                               WalkBooking.BookingStatus.CONFIRMED));

        // 이번 달 산책 시간 계산
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        int walkingHoursThisMonth = walkBookingRepository
                .findByUserIdAndStatusAndCreatedAtAfter(userId,
                        WalkBooking.BookingStatus.COMPLETED, startOfMonth)
                .stream()
                .mapToInt(WalkBooking::getDuration)
                .sum() / 60; // 분을 시간으로 변환

        Double totalSpent = completedWalks.stream()
                .mapToDouble(WalkBooking::getTotalPrice)
                .sum();

        return DashboardResponse.WalkingStats.builder()
                .totalCompletedWalks(completedWalks.size())
                .upcomingWalks(upcomingWalks.size())
                .walkingHoursThisMonth(walkingHoursThisMonth)
                .totalAmountSpent(totalSpent)
                .averageRating(4.5) // 향후 구현
                .build();
    }

    private List<WalkerSummaryResponse> getRecommendedWalkers(Long userId) {
        // 평점 높은 순으로 추천
        return walkerRepository
                .findByStatusActiveOrderByRatingDesc(PageRequest.of(0, 5))
                .stream()
                .map(WalkerSummaryResponse::from)
                .collect(Collectors.toList());
    }

    private List<WalkerSummaryResponse> getFavoriteWalkers(Long userId) {
        // 향후 즐겨찾기 기능 구현 시 사용
        return List.of(); // 임시로 빈 리스트
    }

    private DashboardResponse.ShoppingOverview buildShoppingOverview(Long userId) {
        // 향후 주문 관련 기능 구현 시 연동
        return DashboardResponse.ShoppingOverview.builder()
                .totalOrders(0)
                .pendingOrders(0)
                .totalSpent(0.0)
                .activeSubscriptions(0)
                .cartItemCount(0)
                .lastOrderDate(null)
                .build();
    }

    private DashboardResponse.ChatOverview buildChatOverview(Long userId) {
        // 향후 채팅 관련 통계 구현 시 연동
        return DashboardResponse.ChatOverview.builder()
                .totalChatRooms(0)
                .unreadMessages(0)
                .activeChatRooms(0)
                .lastMessageTime(null)
                .build();
    }

    private DashboardResponse.OverallStats buildOverallStats(User user) {
        int totalActivities = walkBookingRepository
                .findByUserId(user.getId()).size();

        return DashboardResponse.OverallStats.builder()
                .memberSince(user.getCreatedAt())
                .totalActivities(totalActivities)
                .preferredActivityType("산책") // 향후 분석 로직 추가
                .satisfactionScore(4.2) // 향후 구현
                .build();
    }

    // 개별 섹션 조회를 위한 추가 메서드들

    public DashboardResponse.OverallStats getDashboardSummary(Long userId) {
        User user = findUserById(userId);
        return buildOverallStats(user);
    }

    public DashboardResponse.UserInfo getUserInfo(Long userId) {
        User user = findUserById(userId);
        return buildUserInfo(user);
    }

    public DashboardResponse.PetStats getPetStats(Long userId) {
        User user = findUserById(userId);
        return buildPetStats(user.getId());
    }

    public DashboardResponse.WalkingStats getWalkingStats(Long userId) {
        User user = findUserById(userId);
        return buildWalkingStats(user.getId());
    }

    public DashboardResponse.ShoppingOverview getShoppingOverview(Long userId) {
        User user = findUserById(userId);
        return buildShoppingOverview(user.getId());
    }

    public DashboardResponse.ChatOverview getChatOverview(Long userId) {
        User user = findUserById(userId);
        return buildChatOverview(user.getId());
    }

    public DashboardResponse refreshDashboard(Long userId) {
        // 캐시가 있다면 여기서 무효화
        // 현재는 단순히 getDashboard를 호출
        return getDashboard(userId);
    }
}