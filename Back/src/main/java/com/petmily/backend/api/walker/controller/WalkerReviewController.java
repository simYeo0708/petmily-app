package com.petmily.backend.api.walker.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.walker.dto.walkerReview.WalkerReviewRequest;
import com.petmily.backend.api.walker.dto.walkerReview.WalkerReviewResponse;
import com.petmily.backend.api.walker.dto.walkerReview.WalkerReportRequest;
import com.petmily.backend.api.walker.service.WalkerReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        WalkerReviewResponse response = walkerReviewService.createReview(userId, request);
        return ResponseEntity.ok(response);
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
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        List<WalkerReviewResponse> reviews = walkerReviewService.getUserReviews(userId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<WalkerReviewResponse> getReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        WalkerReviewResponse review = walkerReviewService.getReview(reviewId, userId);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<WalkerReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody WalkerReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        WalkerReviewResponse updatedReview = walkerReviewService.updateReview(reviewId, userId, request);
        return ResponseEntity.ok(updatedReview);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        walkerReviewService.deleteReview(reviewId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 사용자가 리뷰를 작성할 수 있는 완료된 예약 목록 조회
     */
    @GetMapping("/reviewable-bookings")
    public ResponseEntity<List<Map<String, Object>>> getReviewableBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        List<Map<String, Object>> reviewableBookings = walkerReviewService.getReviewableBookings(userId);
        return ResponseEntity.ok(reviewableBookings);
    }

    /**
     * 워커 신고
     */
    @PostMapping("/report")
    public ResponseEntity<String> reportWalker(
            @Valid @RequestBody WalkerReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        String result = walkerReviewService.reportWalker(userId, request);
        return ResponseEntity.ok(result);
    }

    /**
     * 내가 신고한 목록 조회
     */
    @GetMapping("/my-reports")
    public ResponseEntity<List<Map<String, Object>>> getMyReports(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        List<Map<String, Object>> reports = walkerReviewService.getUserReports(userId);
        return ResponseEntity.ok(reports);
    }

}
