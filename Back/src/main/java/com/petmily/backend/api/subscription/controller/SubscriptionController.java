package com.petmily.backend.api.subscription.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.subscription.dto.*;
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
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<SubscriptionListResponse> getSubscriptions(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long userId = SecurityUtils.getUserId(userDetails);
        SubscriptionListResponse subscriptions = subscriptionService.getSubscriptions(userId, pageable);
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionDetailResponse> getSubscription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        SubscriptionDetailResponse subscription = subscriptionService.getSubscription(id, userId);
        return ResponseEntity.ok(subscription);
    }

    @PostMapping
    public ResponseEntity<SubscriptionDetailResponse> createSubscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SubscriptionCreateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        SubscriptionDetailResponse subscription = subscriptionService.createSubscription(userId, request);
        return ResponseEntity.ok(subscription);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionDetailResponse> updateSubscription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SubscriptionUpdateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        SubscriptionDetailResponse subscription = subscriptionService.updateSubscription(id, userId, request);
        return ResponseEntity.ok(subscription);
    }

    @PutMapping("/{id}/pause")
    public ResponseEntity<Void> pauseSubscription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) LocalDate pauseUntil) {
        Long userId = SecurityUtils.getUserId(userDetails);
        subscriptionService.pauseSubscription(id, userId, pauseUntil);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/resume")
    public ResponseEntity<Void> resumeSubscription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        subscriptionService.resumeSubscription(id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelSubscription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        subscriptionService.cancelSubscription(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<SubscriptionHistoryResponse> getSubscriptionHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long userId = SecurityUtils.getUserId(userDetails);
        SubscriptionHistoryResponse history = subscriptionService.getSubscriptionHistory(id, userId, pageable);
        return ResponseEntity.ok(history);
    }
}