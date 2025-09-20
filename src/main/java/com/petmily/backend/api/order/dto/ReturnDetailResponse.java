package com.petmily.backend.api.order.dto;

import com.petmily.backend.domain.order.entity.ReturnReason;
import com.petmily.backend.domain.order.entity.ReturnStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnDetailResponse {
    private Long id;
    private Long orderId;
    private Long userId;
    private ReturnReason reason;
    private String detailedReason;
    private ReturnStatus status;
    private BigDecimal returnAmount;
    private String collectionAddress;
    private String trackingNumber;
    private String adminMemo;
    private String rejectionReason;
    private String refundMethod;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private LocalDateTime processedAt;
    private LocalDateTime refundedAt;
    
    // 주문 정보
    private OrderSummary orderInfo;
    
    // 반품 상품 목록
    private List<ReturnItemInfo> returnItems;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderSummary {
        private Long orderId;
        private String orderNumber;
        private LocalDateTime orderDate;
        private String receiverName;
        private BigDecimal totalAmount;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReturnItemInfo {
        private Long id;
        private Long orderItemId;
        private Long productId;
        private String productName;
        private String productImage;
        private String brand;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal returnAmount;
        private String conditionNote;
    }
}