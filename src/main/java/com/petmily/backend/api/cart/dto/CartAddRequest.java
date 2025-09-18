package com.petmily.backend.api.cart.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartAddRequest {
    
    @NotNull(message = "상품 ID는 필수입니다")
    private Long productId;
    
    @NotNull(message = "수량은 필수입니다")
    @Positive(message = "수량은 1개 이상이어야 합니다")
    private Integer quantity;
}