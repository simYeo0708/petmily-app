package com.petmily.backend.domain.order.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
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
    private Double totalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
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
    private DeliveryStatus deliveryStatus = DeliveryStatus.PREPARING;
    
    @Column(name = "tracking_number")
    private String trackingNumber;
    
    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;
    
    @Column(name = "delivery_fee")
    private Double deliveryFee = 0.0;
    
    @Column(name = "final_amount")
    private Double finalAmount;
    
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Column(name = "is_subscription")
    private Boolean isSubscription = false;

    
    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();
    
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private SubscriptionOrder subscriptionOrder;


}

