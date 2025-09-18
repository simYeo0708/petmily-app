package com.petmily.backend.api.category.controller;

import com.petmily.backend.api.category.dto.CategoryCreateRequest;
import com.petmily.backend.api.category.dto.CategoryDetailResponse;
import com.petmily.backend.api.category.dto.CategoryListResponse;
import com.petmily.backend.api.category.dto.CategoryUpdateRequest;
import com.petmily.backend.api.category.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<CategoryListResponse> getCategories() {
        // TODO: 카테고리 목록 조회 구현 (계층구조)
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDetailResponse> getCategory(@PathVariable Long id) {
        // TODO: 카테고리 상세 조회 구현
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<CategoryListResponse> getCategoryChildren(@PathVariable Long id) {
        // TODO: 하위 카테고리 조회 구현
        return ResponseEntity.ok().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDetailResponse> createCategory(
            @Valid @RequestBody CategoryCreateRequest request) {
        // TODO: 카테고리 생성 구현
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDetailResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        // TODO: 카테고리 수정 구현
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        // TODO: 카테고리 삭제 구현
        return ResponseEntity.ok().build();
    }
}