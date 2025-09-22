package com.petmily.backend.domain.order.repository;

import com.petmily.backend.domain.order.entity.Return;
import com.petmily.backend.domain.order.entity.ReturnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRepository extends JpaRepository<Return, Long> {

    // 사용자별 반품 목록 조회 (반품 아이템 포함)
    @Query("SELECT r FROM Return r LEFT JOIN FETCH r.returnItems WHERE r.userId = :userId ORDER BY r.createTime DESC")
    Page<Return> findByUserIdWithItems(@Param("userId") Long userId, Pageable pageable);
    
    // 특정 반품 상세 조회 (아이템 및 상품 정보 포함)
    @Query("SELECT r FROM Return r LEFT JOIN FETCH r.returnItems ri LEFT JOIN FETCH ri.product WHERE r.id = :returnId AND r.userId = :userId")
    Optional<Return> findByIdAndUserIdWithItems(@Param("returnId") Long returnId, @Param("userId") Long userId);
    
    // 주문별 반품 이력 조회
    @Query("SELECT r FROM Return r WHERE r.orderId = :orderId AND r.userId = :userId ORDER BY r.createTime DESC")
    List<Return> findByOrderIdAndUserId(@Param("orderId") Long orderId, @Param("userId") Long userId);
    
    // 반품 상태별 조회
    Page<Return> findByUserIdAndStatusOrderByCreateTimeDesc(Long userId, ReturnStatus status, Pageable pageable);
    
    // 기간별 반품 조회
    @Query("SELECT r FROM Return r WHERE r.userId = :userId AND r.createTime BETWEEN :startDate AND :endDate ORDER BY r.createTime DESC")
    Page<Return> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    // 반품 가능 여부 확인 (동일 주문의 진행 중인 반품이 있는지)
    @Query("SELECT COUNT(r) > 0 FROM Return r WHERE r.orderId = :orderId AND r.status IN ('REQUESTED', 'APPROVED', 'COLLECTED', 'INSPECTED')")
    boolean hasActiveReturnForOrder(@Param("orderId") Long orderId);
    
    // 관리자용: 전체 반품 조회
    @Query("SELECT r FROM Return r LEFT JOIN FETCH r.returnItems WHERE r.status = :status ORDER BY r.createTime DESC")
    Page<Return> findByStatusWithItems(@Param("status") ReturnStatus status, Pageable pageable);
    
    // 관리자용: 처리 대기 중인 반품 개수
    @Query("SELECT COUNT(r) FROM Return r WHERE r.status = 'REQUESTED'")
    long countPendingReturns();
    
    // 사용자별 반품 통계
    @Query("SELECT COUNT(r), COALESCE(SUM(r.returnAmount), 0) FROM Return r WHERE r.userId = :userId AND r.status = 'REFUNDED'")
    Object[] getUserReturnStats(@Param("userId") Long userId);
    
    // 월별 반품 통계 (관리자용)
    @Query("SELECT YEAR(r.createTime), MONTH(r.createTime), COUNT(r), COALESCE(SUM(r.returnAmount), 0) " +
           "FROM Return r WHERE r.status = 'REFUNDED' " +
           "GROUP BY YEAR(r.createTime), MONTH(r.createTime) " +
           "ORDER BY YEAR(r.createTime) DESC, MONTH(r.createTime) DESC")
    List<Object[]> getMonthlyReturnStats();
    
    // 특정 기간 내 완료된 반품 개수
    @Query("SELECT COUNT(r) FROM Return r WHERE r.status = 'REFUNDED' AND r.refundedAt BETWEEN :startDate AND :endDate")
    long countCompletedReturnsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // 주문 아이템별 반품 이력 확인
    @Query("SELECT r FROM Return r JOIN r.returnItems ri WHERE ri.orderItemId = :orderItemId")
    List<Return> findByOrderItemId(@Param("orderItemId") Long orderItemId);
}