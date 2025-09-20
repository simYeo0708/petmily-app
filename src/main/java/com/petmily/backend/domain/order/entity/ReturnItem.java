package com.petmily.backend.domain.order.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.product.entity.Product;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "return_items")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Builder
public class ReturnItem extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "return_id")
    private Long returnId;
    
    @NotNull
    @Column(name = "order_item_id")
    private Long orderItemId;
    
    @NotNull
    @Column(name = "product_id")
    private Long productId;
    
    @NotNull
    @Positive
    @Column(name = "quantity")
    private Integer quantity;
    
    @NotNull
    @Positive
    @Column(name = "price")
    private BigDecimal price;
    
    @Column(name = "return_amount")
    private BigDecimal returnAmount;
    
    @Column(name = "condition_note", columnDefinition = "TEXT")
    private String conditionNote;
    
    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_id", insertable = false, updatable = false)
    private Return returnRequest;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", insertable = false, updatable = false)
    private OrderItem orderItem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;
    
    public static ReturnItem createFromOrderItem(OrderItem orderItem, Integer returnQuantity) {
        BigDecimal returnAmount = orderItem.getPrice().multiply(BigDecimal.valueOf(returnQuantity));
        
        return ReturnItem.builder()
            .orderItemId(orderItem.getId())
            .productId(orderItem.getProductId())
            .quantity(returnQuantity)
            .price(orderItem.getPrice())
            .returnAmount(returnAmount)
            .build();
    }
    
    public void updateConditionNote(String conditionNote) {
        this.conditionNote = conditionNote;
    }
    
    public void updateReturnAmount(BigDecimal returnAmount) {
        this.returnAmount = returnAmount;
    }
}