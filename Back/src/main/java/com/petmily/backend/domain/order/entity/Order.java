package com.petmily.backend.domain.order.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Order extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "user_id")
    private Long userId;
    
    @NotNull
    @Positive
    @Column(name = "total_amount")
    private BigDecimal totalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;
    
    @NotBlank
    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;
    
    @Column(name = "receiver_name")
    private String receiverName;
    
    @Column(name = "receiver_phone")
    private String receiverPhone;
    
    @Column(name = "delivery_memo")
    private String deliveryMemo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status")
    @Builder.Default
    private DeliveryStatus deliveryStatus = DeliveryStatus.PREPARING;
    
    @Column(name = "tracking_number")
    private String trackingNumber;
    
    @Column(name = "discount_amount")
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Column(name = "delivery_fee")
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;
    
    @Column(name = "final_amount")
    private BigDecimal finalAmount;
    
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Column(name = "is_subscription")
    @Builder.Default
    private Boolean isSubscription = false;

    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private SubscriptionOrder subscriptionOrder;

    public void calculateFinalAmount() {
        this.finalAmount = this.totalAmount.subtract(this.discountAmount).add(this.deliveryFee);
    }
    
    public void confirm() {
        if (this.status != OrderStatus.PENDING) {
            throw new IllegalStateException("대기 중인 주문만 확정할 수 있습니다.");
        }
        this.status = OrderStatus.CONFIRMED;
    }
    
    public void ship(String trackingNumber) {
        if (this.status != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("확정된 주문만 배송할 수 있습니다.");
        }
        this.status = OrderStatus.SHIPPED;
        this.deliveryStatus = DeliveryStatus.SHIPPED;
        this.trackingNumber = trackingNumber;
    }
    
    public void deliver() {
        if (this.status != OrderStatus.SHIPPED) {
            throw new IllegalStateException("배송 중인 주문만 배송완료 처리할 수 있습니다.");
        }
        this.status = OrderStatus.DELIVERED;
        this.deliveryStatus = DeliveryStatus.DELIVERED;
    }
    
    public void cancel() {
        if (this.status == OrderStatus.DELIVERED) {
            throw new IllegalStateException("배송완료된 주문은 취소할 수 없습니다.");
        }
        this.status = OrderStatus.CANCELLED;
        this.deliveryStatus = DeliveryStatus.CANCELLED;
    }
    
    public boolean canCancel() {
        return this.status != OrderStatus.DELIVERED;
    }
    
    public boolean isDelivered() {
        return this.status == OrderStatus.DELIVERED;
    }
    
    public void addItem(OrderItem item) {
        this.items.add(item);
    }
    
    public BigDecimal getTotalItemsPrice() {
        return this.items.stream()
            .map(OrderItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

