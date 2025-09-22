package com.petmily.backend.api.order.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewListResponse {
    private List<ReviewDetailResponse> reviews;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean hasNext;
    private boolean hasPrevious;
    
    // 평점 통계 (상품별 리뷰 조회 시)
    private ReviewStats reviewStats;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewStats {
        private Double averageRating;
        private Long totalReviewCount;
        private RatingDistribution ratingDistribution;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RatingDistribution {
        private Long fiveStars;
        private Long fourStars;
        private Long threeStars;
        private Long twoStars;
        private Long oneStars;
    }
}