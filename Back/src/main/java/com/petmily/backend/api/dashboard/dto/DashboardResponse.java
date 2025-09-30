package com.petmily.backend.api.dashboard.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import com.petmily.backend.api.pet.dto.PetSummaryResponse;
import com.petmily.backend.api.walk.dto.booking.WalkBookingResponse;
import com.petmily.backend.api.walker.dto.WalkerSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(builder = DashboardResponse.DashboardResponseBuilder.class)
public class DashboardResponse {

    @JsonPOJOBuilder(withPrefix = "")
    public static class DashboardResponseBuilder {
    }

    // 사용자 정보
    private UserInfo userInfo;

    // 반려동물 관련
    private List<PetSummaryResponse> myPets;
    private PetStats petStats;

    // 산책 관련
    private List<WalkBookingResponse> recentBookings;
    private List<WalkBookingResponse> upcomingBookings;
    private WalkingStats walkingStats;

    // 워커 관련
    private List<WalkerSummaryResponse> recommendedWalkers;
    private List<WalkerSummaryResponse> favoriteWalkers;

    // 쇼핑 관련 (새로 추가)
    private ShoppingOverview shoppingOverview;

    // 채팅 관련 (새로 추가)
    private ChatOverview chatOverview;

    // 전체 요약 통계
    private OverallStats overallStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String name;
        private String email;
        private String profileImageUrl;
        private String membershipLevel; // 일반, 프리미엄 등
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PetStats {
        private int totalPets;
        private String mostRecentPetName;
        private int petsNeedingWalk; // 산책이 필요한 반려동물 수
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WalkingStats {
        private int totalCompletedWalks;
        private int upcomingWalks;
        private int walkingHoursThisMonth;
        private Double totalAmountSpent;
        private Double averageRating; // 워커들로부터 받은 평균 평점
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShoppingOverview {
        private int totalOrders;
        private int pendingOrders;
        private Double totalSpent;
        private int activeSubscriptions;
        private int cartItemCount;
        private LocalDateTime lastOrderDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatOverview {
        private int totalChatRooms;
        private int unreadMessages;
        private int activeChatRooms;
        private LocalDateTime lastMessageTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverallStats {
        private LocalDateTime memberSince;
        private int totalActivities; // 전체 활동 수
        private String preferredActivityType; // 가장 많이 사용하는 기능
        private Double satisfactionScore; // 만족도 점수
    }
}