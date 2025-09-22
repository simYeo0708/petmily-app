package com.petmily.backend.api.order.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.order.dto.*;
import com.petmily.backend.api.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<OrderListResponse> getOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long userId = SecurityUtils.getUserId(userDetails);
        OrderListResponse orders = orderService.getOrders(userId, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailResponse> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        OrderDetailResponse order = orderService.getOrder(id, userId);
        return ResponseEntity.ok(order);
    }

    @PostMapping
    public ResponseEntity<OrderDetailResponse> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderCreateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        OrderDetailResponse order = orderService.createOrder(userId, request);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        orderService.cancelOrder(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<TrackingResponse> getOrderTracking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        TrackingResponse tracking = orderService.getOrderTracking(id, userId);
        return ResponseEntity.ok(tracking);
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<Void> confirmOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        orderService.confirmOrder(id, userId);
        return ResponseEntity.ok().build();
    }

    // ==================== 반품 관련 API ====================

    /**
     * 주문별 반품 목록 조회
     */
    @GetMapping("/{orderId}/returns")
    public ResponseEntity<ReturnListResponse> getOrderReturns(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ReturnListResponse returns = orderService.getOrderReturns(orderId, userId, pageable);
        return ResponseEntity.ok(returns);
    }

    /**
     * 특정 반품 상세 조회
     */
    @GetMapping("/{orderId}/returns/{returnId}")
    public ResponseEntity<ReturnDetailResponse> getOrderReturn(
            @PathVariable Long orderId,
            @PathVariable Long returnId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ReturnDetailResponse returnDetail = orderService.getOrderReturn(orderId, returnId, userId);
        return ResponseEntity.ok(returnDetail);
    }

    /**
     * 반품 요청 생성
     */
    @PostMapping("/{orderId}/returns")
    public ResponseEntity<ReturnDetailResponse> createReturn(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReturnCreateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ReturnDetailResponse returnResponse = orderService.createReturn(orderId, userId, request);
        return ResponseEntity.ok(returnResponse);
    }

    /**
     * 반품 요청 취소 (사용자만 가능)
     */
    @DeleteMapping("/{orderId}/returns/{returnId}")
    public ResponseEntity<Void> cancelReturn(
            @PathVariable Long orderId,
            @PathVariable Long returnId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        orderService.cancelReturn(orderId, returnId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 반품 승인 (관리자 전용)
     */
    @PutMapping("/{orderId}/returns/{returnId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnDetailResponse> approveReturn(
            @PathVariable Long orderId,
            @PathVariable Long returnId,
            @Valid @RequestBody ReturnProcessRequest request) {
        ReturnDetailResponse returnResponse = orderService.approveReturn(orderId, returnId, request);
        return ResponseEntity.ok(returnResponse);
    }

    /**
     * 반품 거절 (관리자 전용)
     */
    @PutMapping("/{orderId}/returns/{returnId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnDetailResponse> rejectReturn(
            @PathVariable Long orderId,
            @PathVariable Long returnId,
            @Valid @RequestBody ReturnProcessRequest request) {
        ReturnDetailResponse returnResponse = orderService.rejectReturn(orderId, returnId, request);
        return ResponseEntity.ok(returnResponse);
    }

    /**
     * 상품 회수 완료 처리 (관리자 전용)
     */
    @PutMapping("/{orderId}/returns/{returnId}/collect")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnDetailResponse> collectReturn(
            @PathVariable Long orderId,
            @PathVariable Long returnId,
            @Valid @RequestBody ReturnProcessRequest request) {
        ReturnDetailResponse returnResponse = orderService.collectReturn(orderId, returnId, request);
        return ResponseEntity.ok(returnResponse);
    }

    /**
     * 상품 검수 완료 처리 (관리자 전용)
     */
    @PutMapping("/{orderId}/returns/{returnId}/inspect")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnDetailResponse> inspectReturn(
            @PathVariable Long orderId,
            @PathVariable Long returnId) {
        ReturnDetailResponse returnResponse = orderService.inspectReturn(orderId, returnId);
        return ResponseEntity.ok(returnResponse);
    }

    /**
     * 환불 완료 처리 (관리자 전용)
     */
    @PutMapping("/{orderId}/returns/{returnId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnDetailResponse> refundReturn(
            @PathVariable Long orderId,
            @PathVariable Long returnId,
            @Valid @RequestBody ReturnProcessRequest request) {
        ReturnDetailResponse returnResponse = orderService.refundReturn(orderId, returnId, request);
        return ResponseEntity.ok(returnResponse);
    }

    // ==================== 리뷰 관련 API ====================

    /**
     * 주문의 리뷰 조회 (있으면 리뷰, 없으면 404)
     */
    @GetMapping("/{orderId}/review")
    public ResponseEntity<ReviewDetailResponse> getOrderReview(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ReviewDetailResponse review = orderService.getOrderReview(orderId, userId);
        return ResponseEntity.ok(review);
    }

    /**
     * 리뷰 작성
     */
    @PostMapping("/{orderId}/review")
    public ResponseEntity<ReviewDetailResponse> createReview(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewCreateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ReviewDetailResponse review = orderService.createReview(orderId, userId, request);
        return ResponseEntity.ok(review);
    }

    /**
     * 리뷰 수정
     */
    @PutMapping("/{orderId}/review")
    public ResponseEntity<ReviewDetailResponse> updateReview(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewUpdateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ReviewDetailResponse review = orderService.updateOrderReview(orderId, userId, request);
        return ResponseEntity.ok(review);
    }

    /**
     * 리뷰 삭제
     */
    @DeleteMapping("/{orderId}/review")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        orderService.deleteOrderReview(orderId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 리뷰에 도움이 됨 추가
     */
    @PostMapping("/{orderId}/review/helpful")
    public ResponseEntity<ReviewDetailResponse> addHelpfulToReview(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ReviewDetailResponse review = orderService.addHelpfulToOrderReview(orderId, userId);
        return ResponseEntity.ok(review);
    }

    /**
     * 리뷰에서 도움이 됨 제거
     */
    @DeleteMapping("/{orderId}/review/helpful")
    public ResponseEntity<ReviewDetailResponse> removeHelpfulFromReview(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ReviewDetailResponse review = orderService.removeHelpfulFromOrderReview(orderId, userId);
        return ResponseEntity.ok(review);
    }

}