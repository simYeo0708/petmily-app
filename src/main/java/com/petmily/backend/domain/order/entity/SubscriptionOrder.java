package com.petmily.backend.domain.order.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "subscription_orders")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
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
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "pause_until")
    private LocalDate pauseUntil;
    
    @Column(name = "delivery_count")
    @Builder.Default
    private Integer deliveryCount = 0;
    
    @Column(name = "max_deliveries")
    private Integer maxDeliveries;
    
    // Relations
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;
    
    // Business methods
    
    public void pause(LocalDate pauseUntil) {
        this.pauseUntil = pauseUntil;
        this.isActive = false;
    }
    
    public void resume() {
        this.pauseUntil = null;
        this.isActive = true;
    }
    
    public void cancel() {
        this.isActive = false;
    }
    
    public void updateNextDeliveryDate(LocalDate nextDate) {
        this.nextDeliveryDate = nextDate;
    }
    
    public void incrementDeliveryCount() {
        this.deliveryCount++;
    }
    
    public boolean isReadyForDelivery(LocalDate today) {
        if (!isActive) return false;
        if (pauseUntil != null && today.isBefore(pauseUntil)) return false;
        if (maxDeliveries != null && deliveryCount >= maxDeliveries) return false;
        return nextDeliveryDate != null && (today.isEqual(nextDeliveryDate) || today.isAfter(nextDeliveryDate));
    }
    
    public boolean isPaused() {
        return pauseUntil != null && LocalDate.now().isBefore(pauseUntil);
    }
    
    public boolean isCompleted() {
        return maxDeliveries != null && deliveryCount >= maxDeliveries;
    }
    
    public LocalDate calculateNextDeliveryDate() {
        if (nextDeliveryDate == null) return null;
        
        switch (subscriptionType) {
            case WEEKLY:
                return nextDeliveryDate.plusWeeks(1);
            case BIWEEKLY:
                return nextDeliveryDate.plusWeeks(2);
            case MONTHLY:
                return nextDeliveryDate.plusMonths(1);
            case CUSTOM:
                return deliveryIntervalDays != null ? 
                    nextDeliveryDate.plusDays(deliveryIntervalDays) : 
                    nextDeliveryDate.plusWeeks(1);
            default:
                return nextDeliveryDate.plusWeeks(1);
        }
    }
}