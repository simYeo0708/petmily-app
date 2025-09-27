package com.petmily.backend.api.payment.dto;

import com.petmily.backend.domain.payment.entity.Payment;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private String transactionId;
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private Payment.PaymentType paymentType;
    private Payment.PaymentMethod paymentMethod;
    private Payment.PaymentStatus status;
    private String paymentGateway;
    private String gatewayTransactionId;
    private String failureReason;
    private LocalDateTime paidAt;
    private LocalDateTime cancelledAt;
    private String memo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PaymentResponse from(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .transactionId(payment.getTransactionId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .paymentType(payment.getPaymentType())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .paymentGateway(payment.getPaymentGateway())
                .gatewayTransactionId(payment.getGatewayTransactionId())
                .failureReason(payment.getFailureReason())
                .paidAt(payment.getPaidAt())
                .cancelledAt(payment.getCancelledAt())
                .memo(payment.getMemo())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}