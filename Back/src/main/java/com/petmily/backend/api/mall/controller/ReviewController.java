package com.petmily.backend.api.mall.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.mall.dto.review.request.ReviewCreateRequest;
import com.petmily.backend.api.mall.dto.review.request.ReviewHelpfulRequest;
import com.petmily.backend.api.mall.dto.review.request.ReviewUpdateRequest;
import com.petmily.backend.api.mall.dto.review.response.ReviewResponse;
import com.petmily.backend.api.mall.dto.review.response.ReviewSummaryResponse;
import com.petmily.backend.api.mall.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 작성
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewCreateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(reviewService.createReview(userId, request));
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewResponse> updateReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewUpdateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(reviewService.updateReview(userId, reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reviewId) {
        Long userId = SecurityUtils.getUserId(userDetails);
        reviewService.deleteReview(userId, reviewId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<Page<ReviewResponse>> getProductReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @RequestParam(required = false, defaultValue = "lastest") String sort,
            Pageable pageable) {
        Long userId = userDetails != null ? SecurityUtils.getUserId(userDetails) : null;
        return ResponseEntity.ok(reviewService.getProductReviews(userId, productId, sort, pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(reviewService.getMyReviews(userId, pageable));
    }

    @GetMapping("/products/{productId}/summary")
    public ResponseEntity<ReviewSummaryResponse> getReviewSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewSummary(productId));
    }

    @PostMapping("/{reviewId}/helpful")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewResponse> voteReviewHelpful(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewHelpfulRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(reviewService.voteReviewHelpful(userId, reviewId, request));
    }


}
