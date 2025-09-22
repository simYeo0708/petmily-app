package com.petmily.backend.api.subscription.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionListResponse {
    private List<SubscriptionSummary> subscriptions;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean hasNext;
    private boolean hasPrevious;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubscriptionSummary {
        private Long id;
        private String subscriptionType;
        private LocalDate nextDeliveryDate;
        private Integer deliveryIntervalDays;
        private Boolean isActive;
        private LocalDate pauseUntil;
        private Integer deliveryCount;
        private Integer maxDeliveries;
        private LocalDateTime createTime;
        
        // 대표 상품 정보
        private String firstProductName;
        private String firstProductImage;
        private int totalItemCount;
        private Double monthlyAmount;
        
        // 최근 주문 정보
        private LocalDateTime lastOrderDate;
        private String lastOrderStatus;
    }
}