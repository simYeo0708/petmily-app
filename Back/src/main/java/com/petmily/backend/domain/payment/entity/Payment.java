package com.petmily.backend.domain.payment.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Payment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String transactionId; // 거래 ID (UUID 등)

    @Column(nullable = false)
    private Long orderId; // 상품 주문 ID

    @Column(nullable = false)
    private Long userId; // 결제자 ID

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount; // 결제 금액

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(length = 50)
    private String paymentGateway; // 결제 게이트웨이 (MOCK, TOSS, KAKAO 등)

    @Column(length = 100)
    private String gatewayTransactionId; // 외부 게이트웨이 거래 ID

    @Column(columnDefinition = "TEXT")
    private String failureReason; // 실패 사유

    private LocalDateTime paidAt; // 결제 완료 시간

    private LocalDateTime cancelledAt; // 취소 시간

    @Column(columnDefinition = "TEXT")
    private String memo; // 결제 관련 메모

    public enum PaymentType {
        PRODUCT_ORDER,      // 상품 주문 결제
        SUBSCRIPTION        // 구독 결제
    }

    public enum PaymentMethod {
        CREDIT_CARD,        // 신용카드
        DEBIT_CARD,         // 체크카드
        BANK_TRANSFER,      // 계좌이체
        KAKAO_PAY,          // 카카오페이
        TOSS_PAY,           // 토스페이
        MOCK                // Mock 결제 (테스트용)
    }

    public enum PaymentStatus {
        PENDING,            // 결제 대기
        PROCESSING,         // 결제 처리 중
        COMPLETED,          // 결제 완료
        FAILED,             // 결제 실패
        CANCELLED,          // 결제 취소
        REFUNDED            // 환불 완료
    }

    // 편의 메소드들
    public boolean isCompleted() {
        return status == PaymentStatus.COMPLETED;
    }

    public boolean isFailed() {
        return status == PaymentStatus.FAILED;
    }

    public boolean isCancellable() {
        return status == PaymentStatus.COMPLETED || status == PaymentStatus.PENDING;
    }

    public void markAsCompleted() {
        this.status = PaymentStatus.COMPLETED;
        this.paidAt = LocalDateTime.now();
    }

    public void markAsFailed(String reason) {
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
    }

    public void markAsCancelled() {
        this.status = PaymentStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
    }
}