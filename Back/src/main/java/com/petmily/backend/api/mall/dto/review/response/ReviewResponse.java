package com.petmily.backend.api.mall.dto.review.response;

import com.petmily.backend.domain.mall.review.entity.Review;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userProfileImage;
    private Long productId;
    private String productName;
    private Long orderId;
    private Integer rating;
    private String content;
    private List<String> imageUrls;
    private Integer helpfulCount;
    private Integer unhelpfulCount;
    private Double helpfulnessScore;
    private Boolean isVerifiedPurchase;
    private String myVote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReviewResponse from(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .userProfileImage(review.getUser().getProfile())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .orderId(review.getOrder().getId())
                .rating(review.getRating())
                .content(review.getContent())
                .imageUrls(review.getImageUrls())
                .helpfulCount(review.getHelpfulCount())
                .unhelpfulCount(review.getUnhelpfulCount())
                .helpfulnessScore(review.getHelpfulnessScore())
                .isVerifiedPurchase(review.getIsVerifiedPurchase())
                .createdAt(review.getCreateTime())
                .updatedAt(review.getUpdateTime())
                .build();
    }

    public static ReviewResponse from(Review review, String myVote) {
        ReviewResponse response = from(review);
        response.setMyVote(myVote);
        return response;
    }

}
