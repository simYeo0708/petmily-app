package com.petmily.backend.api.mall.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.mall.dto.subscription.request.SubscriptionCancelRequest;
import com.petmily.backend.api.mall.dto.subscription.request.SubscriptionUpdateRequest;
import com.petmily.backend.api.mall.dto.subscription.response.SubscriptionResponse;
import com.petmily.backend.api.mall.service.SubscriptionService;
import com.petmily.backend.domain.mall.subscription.entity.SubscriptionStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.Param;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mall/subscriptions")
@PreAuthorize("isAuthenticated()")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * 내 정기배송 목록 조회
     */
    @GetMapping
    public ResponseEntity<Page<SubscriptionResponse>> getMySubscriptions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false)SubscriptionStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)Pageable pageable ){
        Long userId = SecurityUtils.getUserId(userDetails);
        Page<SubscriptionResponse> subscriptions = subscriptionService.getMySubscriptions(userId, status, pageable);
        return ResponseEntity.ok(subscriptions);
    }

    /**
     * 정기배송 상세 조회
     */
    @GetMapping("/{subscriptionId}")
    public ResponseEntity<SubscriptionResponse> getSubscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long subscriptionId) {
        Long userId = SecurityUtils.getUserId(userDetails);
        SubscriptionResponse subscription = subscriptionService.getSubscription(userId, subscriptionId);
        return ResponseEntity.ok(subscription);
    }

    /**
     * 정기배송 수정 (배송지, 수량)
     */
    @PutMapping("/{subscriptionId}")
    public ResponseEntity<SubscriptionResponse> updateSubscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long subscriptionId,
            @Valid @RequestBody SubscriptionUpdateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        SubscriptionResponse subscription = subscriptionService.updateSubscription(userId, subscriptionId, request);
        return ResponseEntity.ok(subscription);
    }

    /**
     * 정기배송 일시정지
     */
    @PostMapping("/{subscriptionId}/pause")
    public ResponseEntity<SubscriptionResponse> pauseSubscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long subscriptionId) {
        Long userId = SecurityUtils.getUserId(userDetails);
        SubscriptionResponse subscription = subscriptionService.pauseSubscription(userId, subscriptionId);
        return ResponseEntity.ok(subscription);
    }

    /**
     * 정기배송 재개
     */
    @PostMapping("/{subscriptionId}/resume")
    public ResponseEntity<SubscriptionResponse> resumeSubscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long subscriptionId) {
        Long userId = SecurityUtils.getUserId(userDetails);
        SubscriptionResponse subscription = subscriptionService.resumeSubscription(userId, subscriptionId);
        return ResponseEntity.ok(subscription);
    }

    /**
     * 정기배송 취소
     */
    @PostMapping("/{subscriptionId}/cancel")
    public ResponseEntity<Void> cancelSubscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long subscriptionId,
            @Valid @RequestBody SubscriptionCancelRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        subscriptionService.cancelSubscription(userId, subscriptionId, request.getReason());
        return ResponseEntity.noContent().build();
    }

    /**
     * 다음 배송 건너뛰기
     */
    @PostMapping("/{subscriptionId}/skip")
    public ResponseEntity<SubscriptionResponse> skipNextDelivery(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long subscriptionId) {
        Long userId = SecurityUtils.getUserId(userDetails);
        SubscriptionResponse subscription = subscriptionService.skipNextDelivery(userId, subscriptionId);
        return ResponseEntity.ok(subscription);
    }
}
