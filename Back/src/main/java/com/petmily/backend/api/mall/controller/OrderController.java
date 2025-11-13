package com.petmily.backend.api.mall.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.mall.dto.order.request.OrderCreateRequest;
import com.petmily.backend.api.mall.dto.order.response.OrderResponse;
import com.petmily.backend.api.mall.service.OrderService;
import com.petmily.backend.domain.mall.order.entity.OrderStatus;
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
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class OrderController {

    private final OrderService orderService;

    // 주문 생성
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderCreateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(orderService.createOrder(userId, request));
    }

    // 주문 목록 조회
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) OrderStatus status,
            Pageable pageable) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(orderService.getOrders(userId, status, pageable));
    }

    // 주문 상세 조회
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(orderService.getOrder(userId, orderId));
    }

    // 주문 취소
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId,
            @RequestParam String reason) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(orderService.cancelOrder(userId, orderId, reason));
    }

    // 판매자용 - 주문 목록 조회
    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<Page<OrderResponse>> getSellerOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(orderService.getSellerOrders(userId, pageable));
    }

    // 판매자/관리자용 - 주문 상태 변경
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(orderService.updateOrderStatus(userId, orderId, status));
    }

}
