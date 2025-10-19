package com.petmily.backend.api.mall.dto.common;

import com.petmily.backend.api.mall.enums.ShoppingMall;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private String productId;
    private String productName;
    private Integer price;
    private String imageUrl;
    private String productUrl;
    private String brand;
    private String mallName;
    private String category;
    private ShoppingMall source;
    private Long reviewCount;
    private Double averageRating;

    // 쿠팡 전용 필드
    private Boolean isRocket;
    private Boolean isFreeShipping;
    private Integer disCountRate;
}
