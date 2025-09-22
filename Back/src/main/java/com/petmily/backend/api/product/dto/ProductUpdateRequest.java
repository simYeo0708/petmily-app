package com.petmily.backend.api.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductUpdateRequest {
    
    @NotBlank(message = "상품명은 필수입니다")
    private String name;
    
    private String description;
    
    @NotNull(message = "가격은 필수입니다")
    @Positive(message = "가격은 0보다 커야 합니다")
    private Double price;
    
    private String imageUrl;
    private String brand;
    private Double weight;
    private String dimensions;
    
    @NotNull(message = "재고는 필수입니다")
    private Integer stock;
    
    @NotNull(message = "카테고리는 필수입니다")
    private Long categoryId;
    
    private Double discountRate;
    private Boolean isActive;
}