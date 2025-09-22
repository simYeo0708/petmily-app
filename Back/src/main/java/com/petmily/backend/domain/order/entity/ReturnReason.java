package com.petmily.backend.domain.order.entity;

public enum ReturnReason {
    DEFECTIVE("제품 불량"),
    DIFFERENT_FROM_DESCRIPTION("상품설명과 다름"),
    SIZE_NOT_FIT("사이즈 불일치"),
    WRONG_ITEM("잘못된 상품 배송"),
    DAMAGED_DURING_DELIVERY("배송 중 파손"),
    SIMPLE_CHANGE_OF_MIND("단순 변심"),
    OTHER("기타");
    
    private final String description;
    
    ReturnReason(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}