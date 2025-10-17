package com.petmily.backend.api.mall.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PetCategory {
    DOG_FOOD("강아지 사료", "강아지 사료"),
    DOG_SNACK("강아지 간식", "강아지 간식"),
    CAT_FOOD("고양이 사료", "고양이 사료"),
    CAT_SNACK("고양이 간식", "고양이 간식"),
    PET_TOY("장난감", "강아지 장난감|고양이 장난감"),
    PET_TOILET("배변용품", "강아지 배변패드|고양이 화장실"),
    PET_SHAMPOO("미용용품", "강아지 샴푸|고양이 샴푸"),
    PET_CLOTHES("의류", "강아지 옷"),
    PET_CARRIER("외출용품", "반려동물 이동가방|펫 유모차"),
    PET_HOUSE("하우스/침대", "강아지 집|고양이 방석");

    private final String displayName;
    private final String searchKeyword;
}
