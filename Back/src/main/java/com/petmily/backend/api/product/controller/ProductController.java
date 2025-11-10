package com.petmily.backend.api.product.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.order.dto.ReviewListResponse;
import com.petmily.backend.api.product.dto.*;
import com.petmily.backend.api.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ProductListResponse> getProducts(
            @ModelAttribute ProductSearchRequest searchRequest,
            Pageable pageable) {
        ProductListResponse products = productService.getProducts(searchRequest, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProduct(@PathVariable Long id) {
        ProductDetailResponse product = productService.getProduct(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ProductListResponse> getProductsByCategory(
            @PathVariable Long categoryId,
            Pageable pageable) {
        ProductListResponse products = productService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<ProductListResponse> searchProducts(
            @ModelAttribute ProductSearchRequest searchRequest,
            Pageable pageable) {
        ProductListResponse products = productService.searchProducts(searchRequest, pageable);
        return ResponseEntity.ok(products);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDetailResponse> createProduct(
            @Valid @RequestBody ProductCreateRequest request) {
        ProductDetailResponse product = productService.createProduct(request);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDetailResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        ProductDetailResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{productId}/reviews")
    public ResponseEntity<ReviewListResponse> getProductReviews(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long currentUserId = userDetails != null ? SecurityUtils.getUserId(userDetails) : null;
        ReviewListResponse reviews = productService.getProductReviews(productId, currentUserId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{productId}/reviews/stats")
    public ResponseEntity<ProductReviewStatsResponse> getProductReviewStats(@PathVariable Long productId) {
        ProductReviewStatsResponse stats = productService.getProductReviewStats(productId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{productId}/reviews/rating/{rating}")
    public ResponseEntity<ReviewListResponse> getProductReviewsByRating(
            @PathVariable Long productId,
            @PathVariable Integer rating,
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long currentUserId = userDetails != null ? SecurityUtils.getUserId(userDetails) : null;
        ReviewListResponse reviews = productService.getProductReviewsByRating(productId, rating, currentUserId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{productId}/reviews/with-images")
    public ResponseEntity<ReviewListResponse> getProductReviewsWithImages(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long currentUserId = userDetails != null ? SecurityUtils.getUserId(userDetails) : null;
        ReviewListResponse reviews = productService.getProductReviewsWithImages(productId, currentUserId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{productId}/reviews/helpful")
    public ResponseEntity<ReviewListResponse> getProductReviewsByHelpful(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long currentUserId = userDetails != null ? SecurityUtils.getUserId(userDetails) : null;
        ReviewListResponse reviews = productService.getProductReviewsByHelpful(productId, currentUserId, pageable);
        return ResponseEntity.ok(reviews);
    }
}