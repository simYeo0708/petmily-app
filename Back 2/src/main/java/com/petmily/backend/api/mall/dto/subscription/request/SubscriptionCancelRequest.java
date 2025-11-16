package com.petmily.backend.api.mall.dto.subscription.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionCancelRequest {

    @NotBlank(message = "취소 사유는 필수입니다")
    private String reason;

}
