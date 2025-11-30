package com.petmily.backend.api.mall.dto.product.response;

import com.petmily.backend.api.mall.service.ProductRecommendationService;
import com.petmily.backend.domain.mall.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecommendationResponse {
    private Long id;
    private String name;
    private String description;
    private String category;
    private Double price;
    private Double averageRating;
    private Long likeCount;
    private Long salesCount;
    private String imageUrl;
    private String reason; // 추천 이유
    private java.util.List<String> ingredients; // 상품 성분 목록
    private java.util.List<String> allergyIngredients; // 알레르기 성분 목록 (사용자 반려동물의 알레르기와 매칭된 것)

    public static ProductRecommendationResponse from(ProductRecommendationService.ProductRecommendation recommendation) {
        Product product = recommendation.getProduct();
        return ProductRecommendationResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .category(product.getCategory() != null ? product.getCategory().toString() : null)
                .price(product.getPrice() != null ? product.getPrice().doubleValue() : 0.0)
                .averageRating(product.getAverageRating())
                .likeCount(product.getLikeCount() != null ? product.getLikeCount().longValue() : 0L)
                .salesCount(product.getSalesCount() != null ? product.getSalesCount().longValue() : 0L)
                .imageUrl(product.getImageUrls() != null && !product.getImageUrls().isEmpty() 
                        ? product.getImageUrls().get(0) : null)
                .reason(recommendation.getReason())
                .ingredients(product.getIngredients())
                .allergyIngredients(recommendation.getAllergyIngredients())
                .build();
    }
}

