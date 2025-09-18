package com.petmily.backend.api.order.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderListResponse {
    private List<OrderSummary> orders;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean hasNext;
    private boolean hasPrevious;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSummary {
        private Long id;
        private String orderNumber;
        private LocalDateTime orderDate;
        private String status;
        private String deliveryStatus;
        private Double totalAmount;
        private Double finalAmount;
        private String receiverName;
        private int itemCount;
        private String firstProductName;
        private String firstProductImage;
        private Boolean isSubscription;
        private LocalDateTime expectedDeliveryDate;
    }
}