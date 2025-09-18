package com.petmily.backend.api.subscription.controller;

import com.petmily.backend.api.subscription.dto.SubscriptionCreateRequest;
import com.petmily.backend.api.subscription.dto.SubscriptionDetailResponse;
import com.petmily.backend.api.subscription.dto.SubscriptionListResponse;
import com.petmily.backend.api.subscription.dto.SubscriptionUpdateRequest;
import com.petmily.backend.api.subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<SubscriptionListResponse> getSubscriptions(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        // TODO: 정기배송 목록 조회 구현
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionDetailResponse> getSubscription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: 정기배송 상세 조회 구현
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<SubscriptionDetailResponse> createSubscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SubscriptionCreateRequest request) {
        // TODO: 정기배송 신청 구현
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionDetailResponse> updateSubscription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SubscriptionUpdateRequest request) {
        // TODO: 정기배송 설정 변경 구현
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/pause")
    public ResponseEntity<Void> pauseSubscription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) LocalDate pauseUntil) {
        // TODO: 정기배송 일시정지 구현
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/resume")
    public ResponseEntity<Void> resumeSubscription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: 정기배송 재개 구현
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelSubscription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: 정기배송 해지 구현
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<SubscriptionHistoryResponse> getSubscriptionHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        // TODO: 정기배송 주문 이력 조회 구현
        return ResponseEntity.ok().build();
    }

    // DTO for subscription history response
    public static class SubscriptionHistoryResponse {
        // TODO: 정기배송 이력 응답 DTO 정의
    }
}