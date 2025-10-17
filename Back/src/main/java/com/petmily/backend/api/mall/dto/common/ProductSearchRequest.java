package com.petmily.backend.api.mall.dto.common;

import com.petmily.backend.api.mall.enums.PetCategory;
import com.petmily.backend.api.mall.enums.ShoppingMall;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSearchRequest {
    private String keyword;
    private PetCategory category;
    private String sort;
    private Integer page = 1;
    private Integer size = 20;
    private ShoppingMall source = ShoppingMall.ALL;
}
