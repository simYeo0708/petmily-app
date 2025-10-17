package com.petmily.backend.api.mall.dto.wishlist;

import com.petmily.backend.api.mall.enums.ShoppingMall;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {
    private Long id;
    private String externalProductId;
    private String productName;
    private Integer savedPrice;
    private Integer currentPrice;
    private String imageUrl;
    private String productUrl;
    private String mallName;
    private ShoppingMall source;
    private LocalDateTime lastChecked;
    private LocalDateTime createdAt;

    private Boolean priceDropped;
    private Integer priceDifference;
}
