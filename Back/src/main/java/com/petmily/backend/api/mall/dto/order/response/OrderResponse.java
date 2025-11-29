package com.petmily.backend.api.mall.dto.order.response;

import com.petmily.backend.domain.mall.order.entity.Order;
import com.petmily.backend.domain.mall.order.entity.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private DeliveryInfoResponse deliveryInfo;
    private LocalDateTime orderedAt;
    private LocalDateTime createdAt;

    public static OrderResponse from(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .items(order.getOrderItems().stream()
                        .map(OrderItemResponse::from)
                        .collect(Collectors.toList()))
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .deliveryInfo(DeliveryInfoResponse.from(order.getDeliveryInfo()))
                .orderedAt(order.getOrderedAt())
                .createdAt(order.getCreatedAt())
                .build();
    }

}
