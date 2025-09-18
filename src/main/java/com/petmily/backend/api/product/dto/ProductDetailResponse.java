package com.petmily.backend.api.product.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private String brand;
    private Double weight;
    private String dimensions;
    private Integer stock;
    private Double discountRate;
    private Double ratingAverage;
    private Integer reviewCount;
    private Boolean isActive;
    private CategoryInfo category;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private Long id;
        private String name;
        private String description;
    }
}