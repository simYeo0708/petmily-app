package com.petmily.backend.api.order.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDetailResponse {
    private Long id;
    private Long orderId;
    private Long orderItemId;
    private Long productId;
    private Long userId;
    private Integer rating;
    private String content;
    private List<String> imageUrls;
    private Boolean isAnonymous;
    private Integer helpfulCount;
    private String adminReply;
    private LocalDateTime adminReplyDate;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    
    // 상품 정보
    private ProductInfo productInfo;
    
    // 작성자 정보
    private ReviewerInfo reviewerInfo;
    
    // 도움이 됨 여부 (현재 사용자 기준)
    private Boolean isHelpful;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductInfo {
        private Long productId;
        private String productName;
        private String productImage;
        private String brand;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewerInfo {
        private Long userId;
        private String username;
        private String profileImage;
        private Boolean isAnonymous;
        private Long totalReviewCount;
    }
}