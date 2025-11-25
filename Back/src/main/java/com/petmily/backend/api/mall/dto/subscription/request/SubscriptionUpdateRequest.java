package com.petmily.backend.api.mall.dto.subscription.request;

import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionUpdateRequest {

    private String recipientName;
    private String recipientPhone;
    private String deliveryAddress;
    private String deliveryMessage;

    @Min(value = 1, message = "수량은 최소 1 이상이어야 합니다")
    private Integer quantity;

}
