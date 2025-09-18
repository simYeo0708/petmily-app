package com.petmily.backend.domain.order.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "subscription_orders")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class SubscriptionOrder extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "order_id")
    private Long orderId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type")
    private SubscriptionType subscriptionType;
    
    @Column(name = "next_delivery_date")
    private LocalDate nextDeliveryDate;
    
    @Column(name = "delivery_interval_days")
    private Integer deliveryIntervalDays;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "pause_until")
    private LocalDate pauseUntil;
    
    @Column(name = "delivery_count")
    private Integer deliveryCount = 0;
    
    @Column(name = "max_deliveries")
    private Integer maxDeliveries;
    
    // Relations
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;
}