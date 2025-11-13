package com.petmily.backend.domain.mall.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryInfo {

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "recipient_phone")
    private String recipientPhone;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "delivery_message")
    private String deliveryMessage;

    @Column(name = "tracking_number")
    private String trackingNumber;

}
