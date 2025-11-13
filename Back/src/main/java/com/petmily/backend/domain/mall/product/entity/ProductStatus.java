package com.petmily.backend.domain.mall.product.entity;

public enum ProductStatus {
    ACTIVE("판매중"),
    INACTIVE("판매중지"),
    OUT_OF_STOCK("품절");

    private final String displayName;

    ProductStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
