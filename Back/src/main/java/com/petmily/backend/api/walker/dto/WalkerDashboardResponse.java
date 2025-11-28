package com.petmily.backend.api.walker.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
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
@JsonDeserialize(builder = WalkerDashboardResponse.WalkerDashboardResponseBuilder.class)
public class WalkerDashboardResponse {

    @JsonPOJOBuilder(withPrefix = "")
    public static class WalkerDashboardResponseBuilder {
    }

    // 수익 정보
    private EarningsInfo earningsInfo;

    // 통계 정보
    private StatisticsInfo statisticsInfo;

    // 최근 리뷰
    private List<ReviewInfo> recentReviews;

    // 다가오는 예약 일정
    private List<UpcomingBookingInfo> upcomingBookings;

    // 주간 수익 추이 (최근 5주)
    private List<WeeklyEarnings> weeklyEarnings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EarningsInfo {
        private Double totalEarnings;      // 총 누적 수익
        private Double thisMonthEarnings;   // 이번 달 수익
        private Double thisWeekEarnings;    // 이번 주 수익
        private Double todayEarnings;       // 오늘 수익
        private Double growthRate;          // 지난달 대비 성장률 (%)
        private LocalDateTime nextPayoutDate; // 다음 정산 예정일
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatisticsInfo {
        private Integer totalWalks;        // 총 산책 횟수
        private Integer completedWalks;    // 완료된 산책 횟수
        private Integer pendingWalks;       // 대기 중인 산책 횟수
        private Double averageRating;       // 평균 평점
        private Integer totalReviews;       // 총 리뷰 수
        private Double repeatRate;          // 재요청률 (%)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewInfo {
        private Long id;
        private String userName;           // 리뷰 작성자 이름
        private Double rating;             // 평점
        private String comment;            // 리뷰 내용
        private LocalDateTime createdAt;   // 작성일
        private String petName;            // 반려동물 이름
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingBookingInfo {
        private Long id;
        private LocalDateTime date;        // 예약 날짜/시간
        private String petName;            // 반려동물 이름
        private String petBreed;           // 반려동물 품종
        private String notes;              // 특이사항
        private String status;              // 예약 상태
        private String address;            // 픽업 주소
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyEarnings {
        private String weekLabel;          // "4주전", "3주전" 등
        private Double earnings;            // 해당 주 수익
    }
}

