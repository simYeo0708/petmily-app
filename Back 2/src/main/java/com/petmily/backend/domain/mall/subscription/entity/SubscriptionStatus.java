package com.petmily.backend.domain.mall.subscription.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SubscriptionStatus {
    ACTIVE("활성"),
    PAUSED("일시정지"),
    CANCELED("취소됨"),
    COMPLETED("완료됨");

    private final String displayName;
}
