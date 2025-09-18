package com.petmily.backend.api.subscription.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class SubscriptionCreateRequest {
    
    @NotEmpty(message = "정기배송할 상품을 선택해주세요")
    private List<SubscriptionItem> items;
    
    @NotNull(message = "정기배송 유형은 필수입니다")
    private String subscriptionType; // WEEKLY, BIWEEKLY, MONTHLY, CUSTOM
    
    private Integer deliveryIntervalDays; // CUSTOM 타입일 때 필요
    
    @NotNull(message = "첫 배송일은 필수입니다")
    private LocalDate firstDeliveryDate;
    
    private Integer maxDeliveries; // 최대 배송 횟수 (무제한시 null)
    
    // 배송 정보 (첫 주문과 동일)
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String deliveryMemo;
    private String paymentMethod;

    @Getter
    @Setter
    public static class SubscriptionItem {
        @NotNull(message = "상품 ID는 필수입니다")
        private Long productId;
        
        @NotNull(message = "수량은 필수입니다")
        @Positive(message = "수량은 1개 이상이어야 합니다")
        private Integer quantity;
    }
}