package com.petmily.backend.api.mall.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.mall.dto.review.ReviewCreateRequest;
import com.petmily.backend.api.mall.dto.review.ReviewResponse;
import com.petmily.backend.api.mall.dto.review.ReviewSummary;
import com.petmily.backend.api.mall.dto.review.ReviewUpdateRequest;
import com.petmily.backend.api.mall.enums.ShoppingMall;
import com.petmily.backend.api.mall.service.review.ReviewService;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mall/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * 리뷰 작성
     */
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ReviewResponse response = reviewService.createReview(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 리뷰 수정
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ReviewResponse response = reviewService.updateReview(reviewId, userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 리뷰 삭제
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        reviewService.deleteReview(reviewId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 상품별 리뷰 목록 조회
     */
    @GetMapping("/products/{productId}")
    public ResponseEntity<Page<ReviewResponse>> getProductReviews(
            @PathVariable String productId,
            @RequestParam ShoppingMall source,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        Page<ReviewResponse> response = reviewService.getProductReviews(productId, source, page, size, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 상품별 리뷰 요약
     */
    @GetMapping("/products/{productId}/summary")
    public ResponseEntity<ReviewSummary> getReviewSummary(
            @PathVariable String productId,
            @RequestParam ShoppingMall source) {
        ReviewSummary summary = reviewService.getReviewSummary(productId, source);
        return ResponseEntity.ok(summary);
    }

    /**
     * 베스트 리뷰 조회
     */
    @GetMapping("/products/{productId}/best")
    public ResponseEntity<List<ReviewResponse>> getBestReviews(
            @PathVariable String productId,
            @RequestParam ShoppingMall source) {
        List<ReviewResponse> response = reviewService.getBestReviews(productId, source);
        return ResponseEntity.ok(response);
    }

    /**
     * 내가 작성한 리뷰 목록
     */
    @GetMapping("/my")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        Page<ReviewResponse> response = reviewService.getMyReviews(userId, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * 도움이 됨 토글
     */
    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<Void> toggleHelpful(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        reviewService.toggleHelpful(reviewId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 별로예요 토글
     */
    @PostMapping("/{reviewId}/not-helpful")
    public ResponseEntity<Void> toggleNotHelpful(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        reviewService.toggleNotHelpful(reviewId, userId);
        return ResponseEntity.ok().build();
    }
}
