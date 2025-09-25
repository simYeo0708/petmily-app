package com.petmily.backend.api.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDetailResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private String iconUrl;
    private Boolean isActive;
    private Integer sortOrder;
    private Long parentId;
    private String parentName;
    private List<CategorySummary> children;
    private int productCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}