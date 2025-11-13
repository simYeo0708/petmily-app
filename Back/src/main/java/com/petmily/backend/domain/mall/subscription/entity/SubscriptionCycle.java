package com.petmily.backend.domain.mall.subscription.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SubscriptionCycle {
    WEEKLY("매주", 7),
    BIWEEKLY("격주", 14),
    MONTHLY("매월", 30);

    private final String displayName;
    private final int days;
}
