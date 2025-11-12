package com.petmily.backend.api.mall.dto.cart.response;

import com.petmily.backend.api.mall.dto.product.response.ProductResponse;
import com.petmily.backend.domain.mall.cart.entity.Cart;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {

    private Long id;
    private ProductResponse product;
    private Integer quantity;
    private BigDecimal totalPrice;

    public static CartResponse from(Cart cart) {
        return CartResponse.builder()
                .id(cart.getId())
                .product(ProductResponse.from(cart.getProduct()))
                .quantity(cart.getQuantity())
                .totalPrice(cart.getProduct().getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())))
                .build();
    }

}
