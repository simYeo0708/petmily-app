package com.petmily.backend.api.category.service;

import com.petmily.backend.api.category.dto.*;
import com.petmily.backend.domain.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryListResponse getCategories() {
        // TODO: 카테고리 목록 조회 로직 구현 (계층구조)
        return null;
    }

    public CategoryDetailResponse getCategory(Long id) {
        // TODO: 카테고리 상세 조회 로직 구현
        return null;
    }

    public CategoryListResponse getCategoryChildren(Long id) {
        // TODO: 하위 카테고리 조회 로직 구현
        return null;
    }

    @Transactional
    public CategoryDetailResponse createCategory(CategoryCreateRequest request) {
        // TODO: 카테고리 생성 로직 구현
        return null;
    }

    @Transactional
    public CategoryDetailResponse updateCategory(Long id, CategoryUpdateRequest request) {
        // TODO: 카테고리 수정 로직 구현
        return null;
    }

    @Transactional
    public void deleteCategory(Long id) {
        // TODO: 카테고리 삭제 로직 구현
    }

    public boolean existsById(Long id) {
        // TODO: 카테고리 존재 여부 확인 로직 구현
        return false;
    }
}