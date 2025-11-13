package com.petmily.backend.domain.mall.subscription.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.mall.order.entity.DeliveryInfo;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Subscription extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscription_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionCycle cycle;

    @Column(name = "next_delivery_date")
    private LocalDate nextDeliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    @Embedded
    private DeliveryInfo deliveryInfo;

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    @Column(columnDefinition = "TEXT")
    private String cancelReason;

    public BigDecimal getCurrentDiscountRate() {
        Product product = this.product;

        long subscriptionDays = ChronoUnit.DAYS.between(
                this.getCreateTime().toLocalDate(),
                LocalDate.now()
        );

        if(subscriptionDays >= 365 && product.getSubscription12MonthDiscount() != null) {
            return product.getSubscription12MonthDiscount();
        } else if(subscriptionDays >= 180 && product.getSubscription6MonthDiscount() != null) {
            return product.getSubscription6MonthDiscount();
        } else if(subscriptionDays >= 90 && product.getSubscription3MonthDiscount() != null) {
            return product.getSubscription3MonthDiscount();
        } else {
            return product.getSubscriptionInitialDiscount();
        }
    }

    public BigDecimal calculateCurrentPrice() {
        BigDecimal basePrice = product.getPrice().multiply(BigDecimal.valueOf(quantity));
        BigDecimal discountRate = getCurrentDiscountRate();
        return basePrice.multiply(BigDecimal.ONE.subtract(discountRate));
    }

    public void pause() {
        if (this.status != SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("활성 상태의 구독만 일시정지할 수 있습니다.");
        }
        this.status = SubscriptionStatus.PAUSED;
    }

    public void resume() {
        if (this.status != SubscriptionStatus.PAUSED) {
            throw new IllegalStateException("일시정지 상태의 구독만 재개할 수 있습니다.");
        }
        this.status = SubscriptionStatus.ACTIVE;
    }

    public void cancel(String reason) {
        if (this.status == SubscriptionStatus.CANCELED || this.status == SubscriptionStatus.COMPLETED) {
            throw new IllegalStateException("이미 종료된 구독입니다.");
        }
        this.status = SubscriptionStatus.CANCELED;
        this.canceledAt = LocalDateTime.now();
        this.cancelReason = reason;
    }

    public void completeDelivery() {
        this.nextDeliveryDate = calculateNextDeliveryDate();
    }

    public void skipNextDelivery() {
        if (this.status != SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("활성 상태의 구독만 건너뛸 수 있습니다.");
        }
        this.nextDeliveryDate = calculateNextDeliveryDate();
    }

    private LocalDate calculateNextDeliveryDate() {
        LocalDate baseDate = this.nextDeliveryDate;
        return switch(this.cycle) {
            case WEEKLY -> baseDate.plusWeeks(1);
            case BIWEEKLY -> baseDate.plusWeeks(2);
            case MONTHLY -> baseDate.plusMonths(1);
        };
    }

    public long getSubscriptionDays() {
        return ChronoUnit.DAYS.between(this.getCreateTime().toLocalDate(), LocalDate.now());
    }

}
