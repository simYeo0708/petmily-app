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
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<CategoryListResponse> getCategories() {
        CategoryListResponse categories = categoryService.getCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDetailResponse> getCategory(@PathVariable Long id) {
        CategoryDetailResponse category = categoryService.getCategory(id);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<CategoryListResponse> getCategoryChildren(@PathVariable Long id) {
        CategoryListResponse children = categoryService.getCategoryChildren(id);
        return ResponseEntity.ok(children);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDetailResponse> createCategory(
            @Valid @RequestBody CategoryCreateRequest request) {
        CategoryDetailResponse category = categoryService.createCategory(request);
        return ResponseEntity.ok(category);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDetailResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        CategoryDetailResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}