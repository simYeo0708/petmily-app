package com.petmily.backend.api.mall.dto.subscription.response;

import com.petmily.backend.api.mall.dto.order.response.DeliveryInfoResponse;
import com.petmily.backend.api.mall.dto.product.response.ProductResponse;
import com.petmily.backend.domain.mall.subscription.entity.Subscription;
import com.petmily.backend.domain.mall.subscription.entity.SubscriptionCycle;
import com.petmily.backend.domain.mall.subscription.entity.SubscriptionStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionResponse {

    private Long id;
    private ProductResponse product;
    private Integer quantity;
    private SubscriptionCycle cycle;
    private String cycleDisplayName;
    private LocalDate nextDeliveryDate;
    private SubscriptionStatus status;
    private String statusDisplayName;
    private DeliveryInfoResponse deliveryInfo;

    // 할인 정보
    private BigDecimal currentDiscountRate;
    private BigDecimal currentPrice;
    private BigDecimal originalPrice;
    private Long subscriptionDays;

    private LocalDateTime createdAt;
    private LocalDateTime canceledAt;
    private String cancelReason;

    public static SubscriptionResponse from(Subscription subscription) {
        BigDecimal originalPrice = subscription.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(subscription.getQuantity()));

        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .product(ProductResponse.from(subscription.getProduct()))
                .quantity(subscription.getQuantity())
                .cycle(subscription.getCycle())
                .cycleDisplayName(subscription.getCycle().getDisplayName())
                .nextDeliveryDate(subscription.getNextDeliveryDate())
                .status(subscription.getStatus())
                .statusDisplayName(subscription.getStatus().getDisplayName())
                .deliveryInfo(DeliveryInfoResponse.from(subscription.getDeliveryInfo()))
                .currentDiscountRate(subscription.getCurrentDiscountRate())
                .currentPrice(subscription.calculateCurrentPrice())
                .originalPrice(originalPrice)
                .subscriptionDays(subscription.getSubscriptionDays())
                .createdAt(subscription.getCreatedAt())
                .canceledAt(subscription.getCanceledAt())
                .cancelReason(subscription.getCancelReason())
                .build();
    }


}
