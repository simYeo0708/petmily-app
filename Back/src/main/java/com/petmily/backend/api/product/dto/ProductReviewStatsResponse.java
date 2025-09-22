package com.petmily.backend.api.product.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReviewStatsResponse {
    private Long productId;
    private Double averageRating;
    private Long totalReviewCount;
    private RatingDistribution ratingDistribution;
    
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