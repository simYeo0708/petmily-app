package com.petmily.backend.domain.payment.repository;

import com.petmily.backend.domain.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * 거래 ID로 결제 조회
     */
    Optional<Payment> findByTransactionId(String transactionId);

    /**
     * 주문 ID로 결제 내역 조회
     */
    List<Payment> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    /**
     * 사용자의 결제 내역 조회
     */
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 특정 상태의 결제 내역 조회
     */
    List<Payment> findByStatus(Payment.PaymentStatus status);

    /**
     * 특정 주문의 완료된 결제 조회
     */
    Optional<Payment> findByOrderIdAndStatus(Long orderId, Payment.PaymentStatus status);

    /**
     * 사용자의 특정 기간 결제 내역
     */
    @Query("SELECT p FROM Payment p WHERE p.userId = :userId " +
           "AND p.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY p.createdAt DESC")
    List<Payment> findByUserIdAndDateRange(@Param("userId") Long userId,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);

    /**
     * 결제 타입별 조회
     */
    List<Payment> findByPaymentTypeAndStatusOrderByCreatedAtDesc(Payment.PaymentType paymentType,
                                                                 Payment.PaymentStatus status);

    /**
     * 외부 게이트웨이 거래 ID로 조회
     */
    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);

    /**
     * 특정 기간의 완료된 결제 통계
     */
    @Query("SELECT COUNT(p), SUM(p.amount) FROM Payment p " +
           "WHERE p.status = 'COMPLETED' " +
           "AND p.paidAt BETWEEN :startDate AND :endDate")
    Object[] getPaymentStatistics(@Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate);
}