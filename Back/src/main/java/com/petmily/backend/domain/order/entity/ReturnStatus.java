package com.petmily.backend.domain.order.entity;

public enum ReturnStatus {
    REQUESTED,      // 반품 신청
    APPROVED,       // 반품 승인
    REJECTED,       // 반품 거절
    COLLECTED,      // 상품 회수 완료
    INSPECTED,      // 검수 완료
    REFUNDED,       // 환불 완료
    CANCELLED       // 반품 취소
}