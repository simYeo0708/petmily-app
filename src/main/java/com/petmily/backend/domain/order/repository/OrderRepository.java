package com.petmily.backend.domain.order.repository;

import com.petmily.backend.domain.order.entity.Order;
import com.petmily.backend.domain.order.entity.OrderStatus;
import com.petmily.backend.domain.order.entity.DeliveryStatus;
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
public interface OrderRepository extends JpaRepository<Order, Long> {

    // 사용자별 주문 목록 조회 (주문 아이템 포함)
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.userId = :userId ORDER BY o.createTime DESC")
    Page<Order> findByUserIdWithItems(@Param("userId") Long userId, Pageable pageable);
    
    // 특정 주문 상세 조회 (아이템 및 상품 정보 포함)
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items oi LEFT JOIN FETCH oi.product WHERE o.id = :orderId AND o.userId = :userId")
    Optional<Order> findByIdAndUserIdWithItems(@Param("orderId") Long orderId, @Param("userId") Long userId);
    
    // 주문 상태별 조회
    Page<Order> findByUserIdAndStatusOrderByCreateTimeDesc(Long userId, OrderStatus status, Pageable pageable);
    
    // 배송 상태별 조회
    Page<Order> findByUserIdAndDeliveryStatusOrderByCreateTimeDesc(Long userId, DeliveryStatus deliveryStatus, Pageable pageable);
    
    // 기간별 주문 조회
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.createTime BETWEEN :startDate AND :endDate ORDER BY o.createTime DESC")
    Page<Order> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    // 주문 번호로 조회
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    
    // 정기배송 주문 조회
    @Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.isSubscription = true ORDER BY o.createTime DESC")
    Page<Order> findSubscriptionOrdersByUserId(@Param("userId") Long userId, Pageable pageable);
    
    // 관리자용: 전체 주문 조회
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.status = :status ORDER BY o.createTime DESC")
    Page<Order> findByStatusWithItems(@Param("status") OrderStatus status, Pageable pageable);
    
    // 관리자용: 배송 상태별 주문 조회
    @Query("SELECT o FROM Order o WHERE o.deliveryStatus = :deliveryStatus ORDER BY o.createTime DESC")
    Page<Order> findByDeliveryStatus(@Param("deliveryStatus") DeliveryStatus deliveryStatus, Pageable pageable);
    
    // 취소 가능한 주문인지 확인
    @Query("SELECT COUNT(o) > 0 FROM Order o WHERE o.id = :orderId AND o.userId = :userId AND o.status IN ('PENDING', 'CONFIRMED')")
    boolean isCancellable(@Param("orderId") Long orderId, @Param("userId") Long userId);
    
    // 사용자별 주문 통계
    @Query("SELECT COUNT(o), COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.userId = :userId AND o.status != 'CANCELLED'")
    Object[] getUserOrderStats(@Param("userId") Long userId);
    
    // 월별 주문 통계 (관리자용)
    @Query("SELECT YEAR(o.createTime), MONTH(o.createTime), COUNT(o), COALESCE(SUM(o.finalAmount), 0) " +
           "FROM Order o WHERE o.status != 'CANCELLED' " +
           "GROUP BY YEAR(o.createTime), MONTH(o.createTime) " +
           "ORDER BY YEAR(o.createTime) DESC, MONTH(o.createTime) DESC")
    List<Object[]> getMonthlyOrderStats();
    
    // 송장번호로 주문 조회
    Optional<Order> findByTrackingNumber(String trackingNumber);
    
    // 특정 기간 내 완료된 주문 개수
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'DELIVERED' AND o.createTime BETWEEN :startDate AND :endDate")
    long countCompletedOrdersBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}

