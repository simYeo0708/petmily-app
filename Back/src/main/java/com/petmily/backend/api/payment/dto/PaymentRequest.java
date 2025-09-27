package com.petmily.backend.api.payment.dto;

import com.petmily.backend.domain.payment.entity.Payment;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    private Long orderId;
    private BigDecimal amount;
    private Payment.PaymentType paymentType;
    private Payment.PaymentMethod paymentMethod;
    private String memo;

    // Mock 결제 테스트용 필드들
    private Boolean shouldFail; // 실패 시뮬레이션 여부
    private String testFailureReason; // 테스트 실패 사유
}