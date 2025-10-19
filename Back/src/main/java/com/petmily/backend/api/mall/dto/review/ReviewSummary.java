package com.petmily.backend.api.mall.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewSummary {
    private Long totalCount;
    private Double averageRating;
    private Long rating5Count;
    private Long rating4Count;
    private Long rating3Count;
    private Long rating2Count;
    private Long rating1Count;
}
