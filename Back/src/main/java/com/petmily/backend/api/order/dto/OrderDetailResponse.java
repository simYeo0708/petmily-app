package com.petmily.backend.api.order.dto;

import lombok.*;
import com.petmily.backend.domain.order.entity.OrderStatus;
import com.petmily.backend.domain.order.entity.DeliveryStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponse {
    private Long id;
    private Long userId;
    private String orderNumber;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private OrderStatus status;
    private DeliveryStatus deliveryStatus;
    private String trackingNumber;
    
    // 주문 금액 정보
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private BigDecimal finalAmount;
    
    // 배송 정보
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String deliveryMemo;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime deliveredDate;
    
    // 결제 정보
    private String paymentMethod;
    private LocalDateTime paymentDate;
    
    // 주문 상품 목록
    private List<OrderItemInfo> items;
    
    // 정기배송 정보
    private Boolean isSubscription;
    private SubscriptionInfo subscriptionInfo;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemInfo {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private String brand;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal totalPrice;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubscriptionInfo {
        private String subscriptionType;
        private Integer deliveryIntervalDays;
        private LocalDateTime nextDeliveryDate;
        private Integer deliveryCount;
        private Integer maxDeliveries;
        private Boolean isActive;
        private LocalDateTime pauseUntil;
    }
}