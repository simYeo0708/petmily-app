package com.petmily.backend.domain.mall.order.entity;

public enum OrderStatus {
    PENDING("결제대기"),
    PAID("결제완료"),
    PREPARING("상품준비중"),
    SHIPPED("배송중"),
    DELIVERED("배송완료"),
    CANCELED("주문취소"),
    REFUNDED("환불완료");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
