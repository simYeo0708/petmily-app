package com.petmily.backend.api.walker.dto.walkerReview;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import com.petmily.backend.domain.walker.entity.WalkerReview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(builder = WalkerReviewResponse.WalkerReviewResponseBuilder.class)
public class WalkerReviewResponse {
    
    @JsonPOJOBuilder(withPrefix = "")
    public static class WalkerReviewResponseBuilder {
    }

    private Long id;
    private Long userId;
    private Long walkerId;
    private Long bookingId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WalkerReviewResponse from(WalkerReview review) {
        return WalkerReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .walkerId(review.getWalkerId())
                .bookingId(review.getBookingId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

}
