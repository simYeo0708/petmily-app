package com.petmily.backend.api.mall.dto.order.response;

import com.petmily.backend.domain.mall.order.entity.DeliveryInfo;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryInfoResponse {

    private String recipientName;
    private String recipientPhone;
    private String deliveryAddress;
    private String deliveryMessage;
    private String trackingNumber;

    public static DeliveryInfoResponse from(DeliveryInfo deliveryInfo) {
        if(deliveryInfo == null) {
            return null;
        }
        return DeliveryInfoResponse.builder()
                .recipientName(deliveryInfo.getRecipientName())
                .recipientPhone(deliveryInfo.getRecipientPhone())
                .deliveryAddress(deliveryInfo.getDeliveryAddress())
                .deliveryMessage(deliveryInfo.getDeliveryMessage())
                .trackingNumber(deliveryInfo.getTrackingNumber())
                .build();
    }

}
