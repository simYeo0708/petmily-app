package com.petmily.backend.domain.mall.order.repository;

import com.petmily.backend.domain.mall.order.entity.Order;
import com.petmily.backend.domain.mall.order.entity.OrderStatus;
import com.petmily.backend.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByUser(User user, Pageable pageable);

    Page<Order> findByUserAndStatus(User user, OrderStatus status, Pageable pageable);

    // 판매자의 주문 조회 (판매자가 판매한 상품의 주문)
    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi WHERE oi.product.seller = :seller")
    Page<Order> findOrdersBySeller(@Param("seller") User seller, Pageable pageable);

    // 전체 주문 통계
    long countByStatus(OrderStatus status);
}
