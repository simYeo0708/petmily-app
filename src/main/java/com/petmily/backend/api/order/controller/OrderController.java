package com.petmily.backend.api.order.controller;

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
        // TODO: 주문 목록 조회 구현
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailResponse> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: 주문 상세 조회 구현
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<OrderDetailResponse> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderCreateRequest request) {
        // TODO: 주문 생성 구현
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: 주문 취소 구현
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<TrackingResponse> getOrderTracking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: 배송 추적 구현
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<Void> confirmOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: 주문 확정 구현
        return ResponseEntity.ok().build();
    }

    // DTO for tracking response
    public static class TrackingResponse {
        // TODO: 배송 추적 응답 DTO 정의
    }
}