package com.petmily.backend.domain.mall.order.entity;

import com.petmily.backend.domain.mall.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;  // 주문 당시의 단가

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;  // quantity * price

    public void calculateTotalPrice() {
        this.totalPrice = this.price.multiply(BigDecimal.valueOf(this.quantity));
    }
}