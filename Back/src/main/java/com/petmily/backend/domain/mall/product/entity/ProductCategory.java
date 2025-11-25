package com.petmily.backend.domain.mall.product.entity;

public enum ProductCategory {
    FOOD("사료"),
    SNACK("간식"),
    TOY("장난감"),
    SUPPLIES("용품"),
    FASHION("패션"),
    HEALTH("건강관리"),
    HYGIENE("위생용품"),
    ETC("기타");

    private final String displayName;

    ProductCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
