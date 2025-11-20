package com.petmily.backend.api.mall.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.mall.dto.product.request.ProductCreateRequest;
import com.petmily.backend.api.mall.dto.product.request.ProductUpdateRequest;
import com.petmily.backend.api.mall.dto.product.response.ProductLikeResponse;
import com.petmily.backend.api.mall.dto.product.response.ProductResponse;
import com.petmily.backend.api.mall.service.ProductService;
import com.petmily.backend.domain.mall.product.entity.ProductCategory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // 상품 등록
    @PostMapping
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProductCreateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(productService.createProduct(userId, request));
    }

    // 상품 수정
    @PutMapping("/{productId}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @Valid @RequestBody ProductUpdateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(productService.updateProduct(userId, productId, request));
    }

    // 상품 삭제
    @DeleteMapping("/{productId}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        Long userId = SecurityUtils.getUserId(userDetails);
        productService.deleteProduct(userId, productId);
        return ResponseEntity.noContent().build();
    }

    // 상품 상세 조회
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        Long userId = SecurityUtils.getUserIdOrNull(userDetails);
        return ResponseEntity.ok(productService.getProduct(userId, productId));
    }

    // 상품 목록 조회 (카테고리별)
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "latest") String sort,
            Pageable pageable) {
        return ResponseEntity.ok(productService.getProducts(category, keyword, sort, pageable));
    }

    // 판매자의 상품 목록 조회
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<Page<ProductResponse>> getProductsBySeller(
            @PathVariable Long sellerId,
            Pageable pageable) {
        return ResponseEntity.ok(productService.getProductsBySeller(sellerId, pageable));
    }

    // 내 상품 목록 조회 (판매자용)
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<Page<ProductResponse>> getMyProducts(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(productService.getMyProducts(userId, pageable));
    }

    // 상품 좋아요 토글
    @PostMapping("/{productId}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProductLikeResponse> toggleProductLike(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ProductLikeResponse response = productService.toggleProductLike(userId, productId);
        return ResponseEntity.ok(response);
    }

    // 좋아요한 상품 목록
    @GetMapping("/liked")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ProductResponse>> getLikedProducts(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(productService.getLikedProducts(userId, pageable));
    }
}
