package com.petmily.backend.domain.order.repository;

import com.petmily.backend.domain.order.entity.SubscriptionOrder;
import com.petmily.backend.domain.order.entity.SubscriptionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionOrderRepository extends JpaRepository<SubscriptionOrder, Long> {
    
    // 특정 사용자의 정기배송 목록 조회 (주문 정보 포함)
    @Query("SELECT so FROM SubscriptionOrder so LEFT JOIN FETCH so.order o WHERE o.userId = :userId ORDER BY so.createTime DESC")
    Page<SubscriptionOrder> findByUserIdWithOrder(@Param("userId") Long userId, Pageable pageable);
    
    // 특정 주문의 정기배송 정보 조회
    Optional<SubscriptionOrder> findByOrderId(Long orderId);
    
    // 특정 사용자의 활성 정기배송 목록
    @Query("SELECT so FROM SubscriptionOrder so LEFT JOIN FETCH so.order o WHERE o.userId = :userId AND so.isActive = true ORDER BY so.nextDeliveryDate ASC")
    List<SubscriptionOrder> findActiveSubscriptionsByUserId(@Param("userId") Long userId);
    
    // 오늘 배송 예정인 정기배송 목록
    @Query("SELECT so FROM SubscriptionOrder so LEFT JOIN FETCH so.order o LEFT JOIN FETCH o.items WHERE so.isActive = true AND so.nextDeliveryDate = :date AND (so.pauseUntil IS NULL OR so.pauseUntil < :date)")
    List<SubscriptionOrder> findDueForDelivery(@Param("date") LocalDate date);
    
    // 특정 기간 내 배송 예정인 정기배송 목록
    @Query("SELECT so FROM SubscriptionOrder so WHERE so.isActive = true AND so.nextDeliveryDate BETWEEN :startDate AND :endDate AND (so.pauseUntil IS NULL OR so.pauseUntil < :startDate)")
    List<SubscriptionOrder> findDueForDeliveryBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 정기배송 유형별 조회
    @Query("SELECT so FROM SubscriptionOrder so LEFT JOIN FETCH so.order o WHERE o.userId = :userId AND so.subscriptionType = :type ORDER BY so.createTime DESC")
    Page<SubscriptionOrder> findByUserIdAndSubscriptionType(@Param("userId") Long userId, @Param("type") SubscriptionType type, Pageable pageable);
    
    // 일시정지된 정기배송 목록
    @Query("SELECT so FROM SubscriptionOrder so LEFT JOIN FETCH so.order o WHERE o.userId = :userId AND so.pauseUntil IS NOT NULL AND so.pauseUntil >= CURRENT_DATE ORDER BY so.pauseUntil ASC")
    List<SubscriptionOrder> findPausedSubscriptionsByUserId(@Param("userId") Long userId);
    
    // 정기배송 다음 배송일 업데이트
    @Modifying
    @Query("UPDATE SubscriptionOrder so SET so.nextDeliveryDate = :nextDate, so.deliveryCount = so.deliveryCount + 1 WHERE so.id = :subscriptionId")
    int updateNextDeliveryDate(@Param("subscriptionId") Long subscriptionId, @Param("nextDate") LocalDate nextDate);
    
    // 정기배송 일시정지
    @Modifying
    @Query("UPDATE SubscriptionOrder so SET so.pauseUntil = :pauseUntil WHERE so.id = :subscriptionId AND so.order.userId = :userId")
    int pauseSubscription(@Param("subscriptionId") Long subscriptionId, @Param("userId") Long userId, @Param("pauseUntil") LocalDate pauseUntil);
    
    // 정기배송 재개
    @Modifying
    @Query("UPDATE SubscriptionOrder so SET so.pauseUntil = NULL WHERE so.id = :subscriptionId AND so.order.userId = :userId")
    int resumeSubscription(@Param("subscriptionId") Long subscriptionId, @Param("userId") Long userId);
    
    // 정기배송 해지
    @Modifying
    @Query("UPDATE SubscriptionOrder so SET so.isActive = false WHERE so.id = :subscriptionId AND so.order.userId = :userId")
    int cancelSubscription(@Param("subscriptionId") Long subscriptionId, @Param("userId") Long userId);
    
    // 최대 배송 횟수 도달한 정기배송 자동 해지
    @Modifying
    @Query("UPDATE SubscriptionOrder so SET so.isActive = false WHERE so.isActive = true AND so.maxDeliveries IS NOT NULL AND so.deliveryCount >= so.maxDeliveries")
    int deactivateCompletedSubscriptions();
    
    // 사용자별 정기배송 통계
    @Query("SELECT COUNT(so), COALESCE(AVG(so.deliveryIntervalDays), 0) FROM SubscriptionOrder so LEFT JOIN so.order o WHERE o.userId = :userId AND so.isActive = true")
    Object[] getUserSubscriptionStats(@Param("userId") Long userId);
    
    // 전체 정기배송 통계 (관리자용)
    @Query("SELECT so.subscriptionType, COUNT(so) FROM SubscriptionOrder so WHERE so.isActive = true GROUP BY so.subscriptionType")
    List<Object[]> getSubscriptionTypeStats();
    
    // 특정 사용자의 정기배송 존재 여부 확인
    @Query("SELECT COUNT(so) > 0 FROM SubscriptionOrder so LEFT JOIN so.order o WHERE o.userId = :userId AND so.id = :subscriptionId")
    boolean existsByIdAndUserId(@Param("subscriptionId") Long subscriptionId, @Param("userId") Long userId);
}