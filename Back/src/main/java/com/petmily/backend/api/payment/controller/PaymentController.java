package com.petmily.backend.api.payment.controller;

import com.petmily.backend.api.payment.dto.PaymentRequest;
import com.petmily.backend.api.payment.dto.PaymentResponse;
import com.petmily.backend.api.payment.service.MockPaymentService;
import com.petmily.backend.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final MockPaymentService mockPaymentService;
    private final UserService userService;

    /**
     * 결제 처리 (Mock)
     */
    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(
            @RequestBody PaymentRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        Long userId = userService.findByUsername(username).getId();

        PaymentResponse response = mockPaymentService.processPayment(request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 결제 취소
     */
    @PostMapping("/{transactionId}/cancel")
    public ResponseEntity<PaymentResponse> cancelPayment(
            @PathVariable String transactionId,
            Authentication authentication) {

        String username = authentication.getName();
        Long userId = userService.findByUsername(username).getId();

        PaymentResponse response = mockPaymentService.cancelPayment(transactionId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 결제 내역 조회
     */
    @GetMapping("/{transactionId}")
    public ResponseEntity<PaymentResponse> getPayment(
            @PathVariable String transactionId,
            Authentication authentication) {

        String username = authentication.getName();
        Long userId = userService.findByUsername(username).getId();

        PaymentResponse response = mockPaymentService.getPayment(transactionId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 내 결제 내역 목록 조회
     */
    @GetMapping("/my")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(Authentication authentication) {
        String username = authentication.getName();
        Long userId = userService.findByUsername(username).getId();

        List<PaymentResponse> responses = mockPaymentService.getUserPayments(userId);
        return ResponseEntity.ok(responses);
    }

    /**
     * 특정 주문의 결제 내역 조회
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentResponse>> getOrderPayments(
            @PathVariable Long orderId,
            Authentication authentication) {

        String username = authentication.getName();
        Long userId = userService.findByUsername(username).getId();

        List<PaymentResponse> responses = mockPaymentService.getOrderPayments(orderId, userId);
        return ResponseEntity.ok(responses);
    }
}