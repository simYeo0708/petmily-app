package com.petmily.backend.api.mall.dto.order.request;

import com.petmily.backend.domain.mall.subscription.entity.SubscriptionCycle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequest {

    @NotEmpty(message = "주문 상품은 필수입니다")
    private List<OrderItemRequest> items;

    @NotBlank(message = "수령인 이름은 필수입니다")
    private String recipientName;

    @NotBlank(message = "수령인 전화번호는 필수입니다")
    private String recipientPhone;

    @NotBlank(message = "배송 주소는 필수입니다")
    private String deliveryAddress;

    private String deliveryMessage;

    private Boolean isSubscription;

    private SubscriptionCycle subscriptionCycle;

}
