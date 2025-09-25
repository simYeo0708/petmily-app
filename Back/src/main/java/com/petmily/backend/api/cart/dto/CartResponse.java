package com.petmily.backend.api.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {
    private List<CartItemInfo> items;
    private int totalItemCount;
    private int selectedItemCount;
    private Double totalPrice;
    private Double selectedPrice;
    private Double totalDiscountAmount;
    private Double deliveryFee;
    private Double finalPrice;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemInfo {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private String brand;
        private Double price;
        private Double discountRate;
        private Double discountedPrice;
        private Integer quantity;
        private Integer stock;
        private Boolean isSelected;
        private Boolean isAvailable;
    }
}