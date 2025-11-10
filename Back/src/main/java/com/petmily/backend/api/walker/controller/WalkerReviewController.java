package com.petmily.backend.api.walker.controller;

import com.petmily.backend.api.walker.dto.walkerReview.WalkerReviewRequest;
import com.petmily.backend.api.walker.dto.walkerReview.WalkerReviewResponse;
import com.petmily.backend.api.walker.service.WalkerReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/walker/reviews")
@RequiredArgsConstructor
public class WalkerReviewController {

    private final WalkerReviewService walkerReviewService;

    @PostMapping
    public ResponseEntity<WalkerReviewResponse> createReview(
            @Valid @RequestBody WalkerReviewRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WalkerReviewResponse walkerReviewResponse = walkerReviewService.createReview(username, request);
        return ResponseEntity.ok(walkerReviewResponse);
    }

    @GetMapping("/walker/{walkerId}")
    public ResponseEntity<List<WalkerReviewResponse>> getWalkerReviews(
            @PathVariable Long walkerId) {
        List<WalkerReviewResponse> reviews = walkerReviewService.getWalkerReviews(walkerId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/walker/{walkerId}/average")
    public ResponseEntity<Map<String, Object>> getWalkerAverageRating(
            @PathVariable Long walkerId) {
        Map<String, Object> averageData = walkerReviewService.getWalkerAverageRating(walkerId);
        return ResponseEntity.ok(averageData);
    }

    @GetMapping("/my")
    public ResponseEntity<List<WalkerReviewResponse>> getMyReviews(
            Authentication authentication) {
        String username = authentication.getName();
        List<WalkerReviewResponse> reviews = walkerReviewService.getUserReviews(username);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<WalkerReviewResponse> getReview(
            @PathVariable Long reviewId,
            Authentication authentication) {
        String username = authentication.getName();
        WalkerReviewResponse review = walkerReviewService.getReview(reviewId, username);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<WalkerReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody WalkerReviewRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WalkerReviewResponse updatedReview = walkerReviewService.updateReview(reviewId, username, request);
        return ResponseEntity.ok(updatedReview);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {
        String username = authentication.getName();
        walkerReviewService.deleteReview(reviewId, username);
        return ResponseEntity.ok().build();
    }

    /**
     * 사용자가 리뷰를 작성할 수 있는 완료된 예약 목록 조회
     */
    @GetMapping("/reviewable-bookings")
    public ResponseEntity<List<Map<String, Object>>> getReviewableBookings(
            Authentication authentication) {
        String username = authentication.getName();
        List<Map<String, Object>> reviewableBookings = walkerReviewService.getReviewableBookings(username);
        return ResponseEntity.ok(reviewableBookings);
    }

}
