package com.petmily.backend.api.order.dto;

import com.petmily.backend.domain.order.entity.DeliveryStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackingResponse {
    private Long orderId;
    private String trackingNumber;
    private DeliveryStatus currentStatus;
    private LocalDateTime lastUpdated;
    private String deliveryCompany;
    private String receiverName;
    private String shippingAddress;
    private LocalDateTime estimatedDeliveryDate;
    private List<TrackingEvent> trackingEvents;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrackingEvent {
        private LocalDateTime eventTime;
        private String location;
        private String description;
        private DeliveryStatus status;
    }
}