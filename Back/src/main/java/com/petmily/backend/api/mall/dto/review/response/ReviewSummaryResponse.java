package com.petmily.backend.api.mall.dto.review.response;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewSummaryResponse {

    private Long productId;
    private Double averageRating;
    private Long totalReviews;
    private Map<Integer, Long> ratingDistribution;
    private Long photoReviewCount;

}
