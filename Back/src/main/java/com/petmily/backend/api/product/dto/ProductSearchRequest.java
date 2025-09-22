package com.petmily.backend.api.product.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSearchRequest {
    private String keyword;
    private Long categoryId;
    private Double minPrice;
    private Double maxPrice;
    private String brand;
    private String sortBy = "createTime";
    private String sortDirection = "desc";
    private Boolean isActive = true;
}