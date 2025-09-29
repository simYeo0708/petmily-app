package com.petmily.backend.api.payment.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.payment.dto.PaymentRequest;
import com.petmily.backend.api.payment.dto.PaymentResponse;
import com.petmily.backend.domain.payment.entity.Payment;
import com.petmily.backend.domain.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockPaymentService {

    private final PaymentRepository paymentRepository;

    /**
     * Mock 결제 처리 (실제 돈은 움직이지 않음)
     */
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request, Long userId) {
        log.info("Mock 결제 처리 시작 - 주문 ID: {}, 금액: {}, 사용자 ID: {}",
                request.getOrderId(), request.getAmount(), userId);

        // 1. 결제 엔티티 생성
        Payment payment = Payment.builder()
                .transactionId(generateTransactionId())
                .orderId(request.getOrderId())
                .userId(userId)
                .amount(request.getAmount())
                .paymentType(request.getPaymentType() != null ? request.getPaymentType() : Payment.PaymentType.PRODUCT_ORDER)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : Payment.PaymentMethod.MOCK)
                .status(Payment.PaymentStatus.PROCESSING)
                .paymentGateway("MOCK")
                .gatewayTransactionId("MOCK_" + UUID.randomUUID().toString().substring(0, 8))
                .memo(request.getMemo())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // 2. Mock 결제 시뮬레이션
        try {
            simulatePaymentProcess(savedPayment, request);
            log.info("Mock 결제 성공 - 거래 ID: {}", savedPayment.getTransactionId());
        } catch (Exception e) {
            savedPayment.markAsFailed(e.getMessage());
            paymentRepository.save(savedPayment);
            log.error("Mock 결제 실패 - 거래 ID: {}, 사유: {}", savedPayment.getTransactionId(), e.getMessage());
            throw new CustomException(ErrorCode.PAYMENT_FAILED, "결제 처리 중 오류가 발생했습니다: " + e.getMessage());
        }

        return PaymentResponse.from(savedPayment);
    }

    /**
     * Mock 결제 프로세스 시뮬레이션
     */
    private void simulatePaymentProcess(Payment payment, PaymentRequest request) throws Exception {
        // 실패 시뮬레이션 체크
        if (Boolean.TRUE.equals(request.getShouldFail())) {
            String failureReason = request.getTestFailureReason() != null ?
                    request.getTestFailureReason() : "Mock 결제 실패 테스트";
            throw new Exception(failureReason);
        }

        // 결제 방법별 시뮬레이션
        switch (payment.getPaymentMethod()) {
            case CREDIT_CARD:
            case DEBIT_CARD:
                simulateCreditCardPayment(payment);
                break;
            case BANK_TRANSFER:
                simulateBankTransferPayment(payment);
                break;
            case KAKAO_PAY:
                simulateKakaoPayPayment(payment);
                break;
            case TOSS_PAY:
                simulateTossPayPayment(payment);
                break;
            case MOCK:
            default:
                simulateMockPayment(payment);
                break;
        }

        // 결제 완료 처리
        payment.markAsCompleted();
        paymentRepository.save(payment);
    }

    private void simulateCreditCardPayment(Payment payment) throws Exception {
        log.info("신용카드 결제 시뮬레이션 - 거래 ID: {}", payment.getTransactionId());

        // 간단한 검증 시뮬레이션
        if (payment.getAmount().doubleValue() < 0) {
            throw new Exception("결제 금액이 유효하지 않습니다");
        }

        if (payment.getAmount().doubleValue() > 1000000) {
            throw new Exception("결제 한도를 초과했습니다");
        }

        // 결제 처리 지연 시뮬레이션 (실제로는 외부 API 호출)
        Thread.sleep(1000);
        log.info("신용카드 결제 완료 - 거래 ID: {}", payment.getTransactionId());
    }

    private void simulateBankTransferPayment(Payment payment) throws Exception {
        log.info("계좌이체 결제 시뮬레이션 - 거래 ID: {}", payment.getTransactionId());
        Thread.sleep(500);
        log.info("계좌이체 결제 완료 - 거래 ID: {}", payment.getTransactionId());
    }

    private void simulateKakaoPayPayment(Payment payment) throws Exception {
        log.info("카카오페이 결제 시뮬레이션 - 거래 ID: {}", payment.getTransactionId());
        Thread.sleep(800);
        log.info("카카오페이 결제 완료 - 거래 ID: {}", payment.getTransactionId());
    }

    private void simulateTossPayPayment(Payment payment) throws Exception {
        log.info("토스페이 결제 시뮬레이션 - 거래 ID: {}", payment.getTransactionId());
        Thread.sleep(700);
        log.info("토스페이 결제 완료 - 거래 ID: {}", payment.getTransactionId());
    }

    private void simulateMockPayment(Payment payment) throws Exception {
        log.info("Mock 결제 시뮬레이션 - 거래 ID: {} (실제 돈은 움직이지 않음)", payment.getTransactionId());
        Thread.sleep(300);
        log.info("Mock 결제 완료 - 거래 ID: {}", payment.getTransactionId());
    }

    /**
     * 결제 취소
     */
    @Transactional
    public PaymentResponse cancelPayment(String transactionId, Long userId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND, "결제 내역을 찾을 수 없습니다"));

        if (!payment.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.NO_ACCESS, "결제 취소 권한이 없습니다");
        }

        if (!payment.isCancellable()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "취소할 수 없는 결제 상태입니다");
        }

        payment.markAsCancelled();
        Payment savedPayment = paymentRepository.save(payment);

        log.info("결제 취소 완료 - 거래 ID: {}", transactionId);
        return PaymentResponse.from(savedPayment);
    }

    /**
     * 결제 내역 조회
     */
    public PaymentResponse getPayment(String transactionId, Long userId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND, "결제 내역을 찾을 수 없습니다"));

        if (!payment.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.NO_ACCESS, "결제 조회 권한이 없습니다");
        }

        return PaymentResponse.from(payment);
    }

    /**
     * 사용자의 결제 내역 목록 조회
     */
    public List<PaymentResponse> getUserPayments(Long userId) {
        List<Payment> payments = paymentRepository.findByUserIdOrderByCreateTimeDesc(userId);
        return payments.stream()
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 주문의 결제 내역 조회
     */
    public List<PaymentResponse> getOrderPayments(Long orderId, Long userId) {
        List<Payment> payments = paymentRepository.findByOrderIdOrderByCreateTimeDesc(orderId);

        // 사용자 권한 확인 (첫 번째 결제만 확인)
        if (!payments.isEmpty() && !payments.get(0).getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.NO_ACCESS, "주문 결제 조회 권한이 없습니다");
        }

        return payments.stream()
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 거래 ID 생성
     */
    private String generateTransactionId() {
        return "TXN_" + LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
               + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}