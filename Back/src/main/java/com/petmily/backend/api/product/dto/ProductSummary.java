package com.petmily.backend.api.product.dto;

import com.petmily.backend.domain.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductSummary {
    private Long id;
    private String name;
    private Double price;
    private String imageUrl;
    private String brand;
    private Double discountRate;
    private Double ratingAverage;
    private Integer reviewCount;
    private Integer stock;
    private String categoryName;

    public static ProductSummary from(Product product) {
        return new ProductSummary(
            product.getId(),
            product.getName(),
            product.getPrice(),
            product.getImageUrl(),
            product.getBrand(),
            product.getDiscountRate(),
            product.getRatingAverage(),
            product.getReviewCount(),
            product.getStock(),
            product.getCategory() != null ? product.getCategory().getName() : null
        );
    }
}