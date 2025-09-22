package com.petmily.backend.api.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryCreateRequest {
    
    @NotBlank(message = "카테고리명은 필수입니다")
    @Size(min = 1, max = 100, message = "카테고리명은 1-100자여야 합니다")
    private String name;
    
    private String description;
    private String imageUrl;
    private String iconUrl;
    private Long parentId;
    private Integer sortOrder = 0;
    private Boolean isActive = true;
}