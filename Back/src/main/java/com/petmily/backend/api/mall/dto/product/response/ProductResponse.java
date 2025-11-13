package com.petmily.backend.api.mall.dto.product.response;

import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.entity.ProductCategory;
import com.petmily.backend.domain.mall.product.entity.ProductStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private ProductCategory category;
    private ProductStatus status;
    private Long sellerId;
    private String sellerName;
    private List<String> imageUrls;
    private Integer likeCount;
    private Integer viewCount;
    private Integer salesCount;
    private Double averageRating;
    private Integer reviewCount;
    private Boolean isLiked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductResponse from(Product product){
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .category(product.getCategory())
                .status(product.getStatus())
                .sellerId(product.getSeller().getId())
                .sellerName(product.getSeller().getName())
                .imageUrls(product.getImageUrls())
                .likeCount(product.getLikeCount())
                .viewCount(product.getViewCount())
                .salesCount(product.getSalesCount())
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .createdAt(product.getCreateTime())
                .updatedAt(product.getUpdateTime())
                .build();
    }

    public static ProductResponse from(Product product, boolean isLiked) {
        ProductResponse response = from(product);
        response.setIsLiked(isLiked);
        return response;
    }

}
