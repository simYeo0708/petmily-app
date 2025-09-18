package com.petmily.backend.api.order.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.order.dto.OrderCreateRequest;
import com.petmily.backend.api.order.dto.OrderDetailResponse;
import com.petmily.backend.api.order.dto.OrderListResponse;
import com.petmily.backend.api.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
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
        Object tracking = orderService.getOrderTracking(id, userId);
        // TODO: TrackingResponse로 변환 로직 추가
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<Void> confirmOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        orderService.confirmOrder(id, userId);
        return ResponseEntity.ok().build();
    }

    // DTO for tracking response
    public static class TrackingResponse {
        // TODO: 배송 추적 응답 DTO 정의
    }
}