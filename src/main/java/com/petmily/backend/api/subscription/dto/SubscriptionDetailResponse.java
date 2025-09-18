package com.petmily.backend.api.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDetailResponse {
    private Long id;
    private String subscriptionType;
    private Integer deliveryIntervalDays;
    private LocalDate nextDeliveryDate;
    private Boolean isActive;
    private LocalDate pauseUntil;
    private Integer deliveryCount;
    private Integer maxDeliveries;
    private LocalDateTime createTime;
    
    // 배송 정보
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String deliveryMemo;
    private String paymentMethod;
    
    // 정기배송 상품 목록
    private List<SubscriptionItemInfo> items;
    
    // 통계 정보
    private Double monthlyAmount;
    private Double totalSavedAmount;
    private Integer totalOrders;
    private LocalDateTime lastOrderDate;
    private LocalDateTime nextPauseAvailableDate;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionItemInfo {
        private Long productId;
        private String productName;
        private String productImage;
        private String brand;
        private Double price;
        private Double discountRate;
        private Double discountedPrice;
        private Integer quantity;
        private Double totalPrice;
        private Boolean isAvailable;
    }
}