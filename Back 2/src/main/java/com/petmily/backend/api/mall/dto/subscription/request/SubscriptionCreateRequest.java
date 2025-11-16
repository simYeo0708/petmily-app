package com.petmily.backend.api.mall.dto.subscription.request;

import com.petmily.backend.domain.mall.subscription.entity.SubscriptionCycle;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionCreateRequest {

    @NotNull(message = "상품 ID는 필수입니다")
    private Long productId;

    @NotNull(message = "수량은 필수입니다")
    @Min(value = 1, message = "수량은 1 이상이어야 합니다")
    private Integer quantity;

    @NotNull(message = "배송 주기는 필수입니다")
    private SubscriptionCycle cycle;

    @NotNull(message = "시작일은 필수입니다")
    @Future(message = "시작일은 미래 날짜여야 합니다")
    private LocalDate startDate;

    @NotBlank(message = "수령인 이름은 필수입니다")
    private String recipientName;

    @NotBlank(message = "수령인 연락처는 필수입니다")
    private String recipientPhone;

    @NotBlank(message = "배송 주소는 필수입니다")
    private String deliveryAddress;

    private String deliveryMessage;


}
