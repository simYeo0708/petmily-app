package com.petmily.backend.api.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class OrderCreateRequest {
    
    @NotEmpty(message = "주문할 상품을 선택해주세요")
    private List<Long> cartItemIds;
    
    @NotBlank(message = "받는 분 이름은 필수입니다")
    private String receiverName;
    
    @NotBlank(message = "받는 분 연락처는 필수입니다")
    private String receiverPhone;
    
    @NotBlank(message = "배송 주소는 필수입니다")
    private String shippingAddress;
    
    private String deliveryMemo;
    
    @NotBlank(message = "결제 방법은 필수입니다")
    private String paymentMethod;
    
    private Double discountAmount = 0.0;
    private String couponCode;
    
    // 정기배송 관련
    private Boolean isSubscription = false;
    private String subscriptionType;
    private Integer deliveryIntervalDays;
    private Integer maxDeliveries;
}