package com.petmily.backend.domain.order.repository;

import com.petmily.backend.domain.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    // 특정 주문의 주문 아이템들 조회 (상품 정보 포함)
    @Query("SELECT oi FROM OrderItem oi LEFT JOIN FETCH oi.product WHERE oi.orderId = :orderId")
    List<OrderItem> findByOrderIdWithProduct(@Param("orderId") Long orderId);
    
    // 특정 상품의 주문 아이템들 조회
    List<OrderItem> findByProductId(Long productId);
    
    // 특정 사용자의 주문 아이템들 조회 (주문 정보 포함)
    @Query("SELECT oi FROM OrderItem oi LEFT JOIN FETCH oi.order o WHERE o.userId = :userId ORDER BY oi.createTime DESC")
    List<OrderItem> findByUserIdWithOrder(@Param("userId") Long userId);
    
    // 특정 상품의 총 판매량 조회
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi LEFT JOIN oi.order o WHERE oi.productId = :productId AND o.status != 'CANCELLED'")
    Integer getTotalSoldQuantity(@Param("productId") Long productId);
    
    // 특정 상품의 총 매출 조회
    @Query("SELECT COALESCE(SUM(oi.quantity * oi.price), 0) FROM OrderItem oi LEFT JOIN oi.order o WHERE oi.productId = :productId AND o.status != 'CANCELLED'")
    Double getTotalRevenue(@Param("productId") Long productId);
    
    // 베스트셀러 상품 조회 (판매량 기준)
    @Query("SELECT oi.productId, SUM(oi.quantity) as totalSold FROM OrderItem oi LEFT JOIN oi.order o " +
           "WHERE o.status != 'CANCELLED' GROUP BY oi.productId ORDER BY totalSold DESC")
    List<Object[]> findBestSellingProducts();
    
    // 특정 기간 베스트셀러 조회
    @Query("SELECT oi.productId, SUM(oi.quantity) as totalSold FROM OrderItem oi LEFT JOIN oi.order o " +
           "WHERE o.status != 'CANCELLED' AND o.createTime BETWEEN :startDate AND :endDate " +
           "GROUP BY oi.productId ORDER BY totalSold DESC")
    List<Object[]> findBestSellingProductsBetween(@Param("startDate") java.time.LocalDateTime startDate, 
                                                  @Param("endDate") java.time.LocalDateTime endDate);
    
    // 사용자의 구매 이력 기반 추천을 위한 상품 조회
    @Query("SELECT DISTINCT oi.productId FROM OrderItem oi LEFT JOIN oi.order o WHERE o.userId = :userId AND o.status != 'CANCELLED'")
    List<Long> findPurchasedProductIdsByUserId(@Param("userId") Long userId);
    
    // 특정 주문의 총 아이템 개수
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.orderId = :orderId")
    int countByOrderId(@Param("orderId") Long orderId);
    
    // 특정 주문의 총 상품 수량
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.orderId = :orderId")
    Integer getTotalQuantityByOrderId(@Param("orderId") Long orderId);
}