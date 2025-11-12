package com.petmily.backend.domain.mall.order.entity;

import com.petmily.backend.domain.mall.product.entity.Product;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
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

    private Long id;

    private Order order;

    private Product product;

    private Integer quantity;

    private BigDecimal price;

    private BigDecimal totalPrice;

    public void calculateTotalPrice() {
        this.totalPrice = this.price.multiply(BigDecimal.valueOf(this.quantity));
    }
}
