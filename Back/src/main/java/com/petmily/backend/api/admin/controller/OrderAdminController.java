package com.petmily.backend.api.admin.controller;

import com.petmily.backend.api.order.dto.AdminReplyRequest;
import com.petmily.backend.api.order.dto.ReviewDetailResponse;
import com.petmily.backend.api.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class OrderAdminController {

    private final OrderService orderService;

    /**
     * 관리자 답변 추가 (관리자 전용)
     */
    @PostMapping("/{orderId}/review/admin-reply")
    public ResponseEntity<ReviewDetailResponse> addAdminReply(
            @PathVariable Long orderId,
            @Valid @RequestBody AdminReplyRequest request) {
        ReviewDetailResponse review = orderService.addAdminReplyToOrderReview(orderId, request);
        return ResponseEntity.ok(review);
    }

    /**
     * 관리자 답변 수정 (관리자 전용)
     */
    @PutMapping("/{orderId}/review/admin-reply")
    public ResponseEntity<ReviewDetailResponse> updateAdminReply(
            @PathVariable Long orderId,
            @Valid @RequestBody AdminReplyRequest request) {
        ReviewDetailResponse review = orderService.updateAdminReplyToOrderReview(orderId, request);
        return ResponseEntity.ok(review);
    }

    /**
     * 관리자 답변 삭제 (관리자 전용)
     */
    @DeleteMapping("/{orderId}/review/admin-reply")
    public ResponseEntity<Void> deleteAdminReply(@PathVariable Long orderId) {
        orderService.deleteAdminReplyFromOrderReview(orderId);
        return ResponseEntity.ok().build();
    }
}