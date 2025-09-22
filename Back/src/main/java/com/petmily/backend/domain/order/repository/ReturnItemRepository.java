package com.petmily.backend.domain.order.repository;

import com.petmily.backend.domain.order.entity.ReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnItemRepository extends JpaRepository<ReturnItem, Long> {

    // 반품별 아이템 목록 조회
    List<ReturnItem> findByReturnIdOrderByCreateTimeDesc(Long returnId);
    
    // 주문 아이템별 반품 이력 조회
    List<ReturnItem> findByOrderItemIdOrderByCreateTimeDesc(Long orderItemId);
    
    // 상품별 반품 아이템 조회
    @Query("SELECT ri FROM ReturnItem ri JOIN ri.returnRequest r WHERE ri.productId = :productId AND r.status = 'REFUNDED' ORDER BY ri.createTime DESC")
    List<ReturnItem> findRefundedItemsByProductId(@Param("productId") Long productId);
    
    // 주문 아이템의 총 반품 수량 계산
    @Query("SELECT COALESCE(SUM(ri.quantity), 0) FROM ReturnItem ri JOIN ri.returnRequest r WHERE ri.orderItemId = :orderItemId AND r.status IN ('APPROVED', 'COLLECTED', 'INSPECTED', 'REFUNDED')")
    Integer getTotalReturnedQuantityForOrderItem(@Param("orderItemId") Long orderItemId);
    
    // 반품 가능 수량 확인
    @Query("SELECT oi.quantity - COALESCE(SUM(ri.quantity), 0) FROM OrderItem oi LEFT JOIN ReturnItem ri ON oi.id = ri.orderItemId " +
           "LEFT JOIN Return r ON ri.returnId = r.id " +
           "WHERE oi.id = :orderItemId AND (r.status IS NULL OR r.status IN ('APPROVED', 'COLLECTED', 'INSPECTED', 'REFUNDED')) " +
           "GROUP BY oi.quantity")
    Integer getReturnableQuantityForOrderItem(@Param("orderItemId") Long orderItemId);
}