package com.petmily.backend.api.subscription.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionHistoryResponse {
    private List<SubscriptionOrderHistory> orders;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean hasNext;
    private boolean hasPrevious;
    
    // 통계 정보
    private Integer totalDeliveries;
    private BigDecimal totalAmount;
    private BigDecimal averageOrderAmount;
    private LocalDate firstDeliveryDate;
    private LocalDate lastDeliveryDate;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubscriptionOrderHistory {
        private Long orderId;
        private LocalDate deliveryDate;
        private String orderStatus;
        private String deliveryStatus;
        private BigDecimal orderAmount;
        private String trackingNumber;
        private LocalDateTime orderTime;
        private LocalDateTime deliveredTime;
        
        // 주문 상품 목록
        private List<OrderItemInfo> items;
        
        // 배송 정보
        private String receiverName;
        private String shippingAddress;
        private String deliveryMemo;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemInfo {
        private Long productId;
        private String productName;
        private String productImage;
        private String brand;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal totalPrice;
    }
}