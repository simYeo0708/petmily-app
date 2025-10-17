package com.petmily.backend.api.mall.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ShoppingMall {
    NAVER("네이버쇼핑"),
    COUPANG("쿠팡"),
    ALL("전체");

    private final String displayName;
}
