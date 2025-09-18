package com.petmily.backend.api.product.dto;

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
}