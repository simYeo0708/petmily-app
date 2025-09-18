package com.petmily.backend.api.category.service;

import com.petmily.backend.api.category.dto.*;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.product.entity.Category;
import com.petmily.backend.domain.product.repository.CategoryRepository;
import com.petmily.backend.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryListResponse getCategories() {
        List<Category> categories = categoryRepository.findByParentIdIsNullAndIsActiveTrueOrderBySortOrderAsc();
        List<CategorySummary> categorySummaries = categories.stream()
            .map(this::convertToCategorySummaryWithChildren)
            .collect(Collectors.toList());
        
        return new CategoryListResponse(categorySummaries, categorySummaries.size());
    }

    public CategoryDetailResponse getCategory(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));
        
        if (!category.getIsActive()) {
            throw new CustomException(ErrorCode.CATEGORY_INACTIVE);
        }
        
        return convertToDetailResponse(category);
    }

    public CategoryListResponse getCategoryChildren(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new CustomException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        
        List<Category> children = categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(id);
        List<CategorySummary> categorySummaries = children.stream()
            .map(this::convertToCategorySummary)
            .collect(Collectors.toList());
        
        return new CategoryListResponse(categorySummaries, categorySummaries.size());
    }

    @Transactional
    public CategoryDetailResponse createCategory(CategoryCreateRequest request) {
        // 중복 카테고리명 확인
        if (categoryRepository.existsByNameAndIsActiveTrue(request.getName())) {
            throw new CustomException(ErrorCode.CATEGORY_ALREADY_EXISTS);
        }
        
        // 부모 카테고리 존재 확인
        if (request.getParentId() != null && !categoryRepository.existsById(request.getParentId())) {
            throw new CustomException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        
        Category category = Category.builder()
            .name(request.getName())
            .description(request.getDescription())
            .imageUrl(request.getImageUrl())
            .iconUrl(request.getIconUrl())
            .parentId(request.getParentId())
            .sortOrder(request.getSortOrder())
            .isActive(request.getIsActive())
            .build();
        
        Category savedCategory = categoryRepository.save(category);
        return convertToDetailResponse(savedCategory);
    }

    @Transactional
    public CategoryDetailResponse updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));
        
        // 중복 카테고리명 확인 (자신 제외)
        if (categoryRepository.existsByNameAndIsActiveTrueAndIdNot(request.getName(), id)) {
            throw new CustomException(ErrorCode.CATEGORY_ALREADY_EXISTS);
        }
        
        // 부모 카테고리 존재 확인
        if (request.getParentId() != null && !categoryRepository.existsById(request.getParentId())) {
            throw new CustomException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        
        // 자기 자신을 부모로 설정하는 것 방지
        if (request.getParentId() != null && request.getParentId().equals(id)) {
            throw new CustomException(ErrorCode.INVALID_CATEGORY_HIERARCHY);
        }
        
        category.updateCategory(
            request.getName(),
            request.getDescription(),
            request.getImageUrl(),
            request.getIconUrl(),
            request.getParentId(),
            request.getSortOrder(),
            request.getIsActive()
        );
        
        return convertToDetailResponse(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));
        
        // 카테고리에 상품이 있는지 확인
        long productCount = productRepository.countByCategoryIdAndIsActiveTrue(id);
        if (productCount > 0) {
            throw new CustomException(ErrorCode.CATEGORY_HAS_PRODUCTS);
        }
        
        // 하위 카테고리가 있는지 확인
        List<Category> children = categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(id);
        if (!children.isEmpty()) {
            throw new CustomException(ErrorCode.CATEGORY_HAS_PRODUCTS); // 하위 카테고리도 동일한 에러로 처리
        }
        
        // 소프트 삭제
        category.deactivate();
    }

    public boolean existsById(Long id) {
        return categoryRepository.existsById(id);
    }
    
    // Helper methods
    private CategorySummary convertToCategorySummary(Category category) {
        int productCount = (int) productRepository.countByCategoryIdAndIsActiveTrue(category.getId());
        
        return new CategorySummary(
            category.getId(),
            category.getName(),
            category.getDescription(),
            category.getImageUrl(),
            category.getIconUrl(),
            category.getIsActive(),
            category.getSortOrder(),
            category.getParentId(),
            null, // children은 여기서는 null
            productCount
        );
    }
    
    private CategorySummary convertToCategorySummaryWithChildren(Category category) {
        List<Category> children = categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(category.getId());
        List<CategorySummary> childSummaries = children.stream()
            .map(this::convertToCategorySummary)
            .collect(Collectors.toList());
        
        int productCount = (int) productRepository.countByCategoryIdAndIsActiveTrue(category.getId());
        
        return new CategorySummary(
            category.getId(),
            category.getName(),
            category.getDescription(),
            category.getImageUrl(),
            category.getIconUrl(),
            category.getIsActive(),
            category.getSortOrder(),
            category.getParentId(),
            childSummaries,
            productCount
        );
    }
    
    private CategoryDetailResponse convertToDetailResponse(Category category) {
        List<Category> children = categoryRepository.findByParentIdAndIsActiveTrueOrderBySortOrderAsc(category.getId());
        List<CategorySummary> childSummaries = children.stream()
            .map(this::convertToCategorySummary)
            .collect(Collectors.toList());
        
        int productCount = (int) productRepository.countByCategoryIdAndIsActiveTrue(category.getId());
        
        String parentName = null;
        if (category.getParentCategory() != null) {
            parentName = category.getParentCategory().getName();
        }
        
        return new CategoryDetailResponse(
            category.getId(),
            category.getName(),
            category.getDescription(),
            category.getImageUrl(),
            category.getIconUrl(),
            category.getIsActive(),
            category.getSortOrder(),
            category.getParentId(),
            parentName,
            childSummaries,
            productCount,
            category.getCreateTime(),
            category.getUpdateTime()
        );
    }
}