package com.petmily.backend.api.mall.dto.review;

import com.petmily.backend.api.mall.enums.ShoppingMall;
import com.petmily.backend.domain.mall.review.entity.Review;
import com.petmily.backend.domain.mall.review.entity.ReviewHelpful;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String externalProductId;
    private String productName;
    private String productImageUrl;
    private ShoppingMall source;
    private Integer rating;
    private String content;
    private List<String> imageUrls;
    private Integer helpfulCount;
    private Integer notHelpfulCount;
    private Boolean isHelpful;
    private Boolean isNotHelpful;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReviewResponse from(Review review){
        String userName = review.getUser() != null ? maskUserName(review.getUser().getName()) : "익명";

        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .userName(userName)
                .externalProductId(review.getExternalProductId())
                .productName(review.getProductName())
                .productImageUrl(review.getProductImageUrl())
                .source(review.getSource())
                .rating(review.getRating())
                .content(review.getContent())
                .imageUrls(review.getImageUrls())
                .helpfulCount(review.getHelpfulCount())
                .notHelpfulCount(review.getNotHelpfulCount())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    public static ReviewResponse from(Review review, ReviewHelpful userHelpful){
        ReviewResponse response = from(review);

        if(userHelpful != null) {
            response.isHelpful = userHelpful.getType() == ReviewHelpful.HelpfulType.HELPFUL;
            response.isNotHelpful = userHelpful.getType() == ReviewHelpful.HelpfulType.NOT_HELPFUL;
        } else {
            response.isHelpful = false;
            response.isNotHelpful = false;
        }

        return response;
    }

    private static String maskUserName(String name){
        if(name == null || name.length() == 0) return "익명";
        if(name.length() == 1) return name + "*";
        if(name.length() == 2) return name.charAt(0) + "*";
        return name.charAt(0) + "*" + name.charAt(name.length() - 1);
    }
}
