package com.petmily.backend.domain.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@Embeddable
public class Address {

    private String roadAddress; // 도로명 주소

    private String addressDetail; // 상세 주소

    @Column(length = 10)
    private String zipCode; // 우편번호

    @Builder
    public Address(String roadAddress, String addressDetail, String zipCode) {
        this.roadAddress = roadAddress;
        this.addressDetail = addressDetail;
        this.zipCode = zipCode;
    }
}
