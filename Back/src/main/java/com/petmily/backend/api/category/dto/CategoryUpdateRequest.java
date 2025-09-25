package com.petmily.backend.api.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryUpdateRequest {
    
    @NotBlank(message = "카테고리명은 필수입니다")
    @Size(min = 1, max = 100, message = "카테고리명은 1-100자여야 합니다")
    private String name;
    
    private String description;
    private String imageUrl;
    private String iconUrl;
    private Long parentId;
    private Integer sortOrder;
    private Boolean isActive;
}