package com.petmily.backend.api.subscription.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class SubscriptionUpdateRequest {
    
    @NotNull(message = "정기배송 유형은 필수입니다")
    private String subscriptionType;
    
    private Integer deliveryIntervalDays;
    private LocalDate nextDeliveryDate;
    private Integer maxDeliveries;
    
    // 배송 정보 변경
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String deliveryMemo;
    private String paymentMethod;
    
    // 상품 목록 변경
    private List<SubscriptionItemUpdate> items;

    @Getter
    @Setter
    public static class SubscriptionItemUpdate {
        @NotNull(message = "상품 ID는 필수입니다")
        private Long productId;
        
        @NotNull(message = "수량은 필수입니다")
        private Integer quantity;
    }
}