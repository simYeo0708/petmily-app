package com.petmily.backend.api.mall.dto.wishlist;

import com.petmily.backend.api.mall.enums.ShoppingMall;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WishlistAddRequest {

    @NotBlank(message = "상품 ID는 필수입니다")
    private String externalProductId;

    @NotBlank(message = "상품명은 필수입니다")
    private String productName;

    @NotNull(message = "가격은 필수입니다")
    private Integer price;

    @NotBlank(message = "이미지 URL은 필수입니다")
    private String imageUrl;

    @NotBlank(message = "상품 URL은 필수입니다")
    private String productUrl;

    private String mallName;

    @NotNull(message = "출처는 필수입니다")
    private ShoppingMall source;
}
