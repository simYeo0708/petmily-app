package com.petmily.backend.api.pet.dto;

import com.petmily.backend.domain.pet.entity.Pet;
import lombok.Data;

@Data
public class PetSearchRequest {
    private String species; // 개, 고양이 등으로 필터링
    private String breed; // 품종으로 필터링
    private Pet.Size size; // 크기로 필터링
    private Pet.ActivityLevel activityLevel; // 활동량으로 필터링
    private Boolean goodWithChildren; // 아이와 잘 어울리는지로 필터링
    private Boolean goodWithOtherPets; // 다른 반려동물과 잘 어울리는지로 필터링
    private Integer minAge; // 최소 나이
    private Integer maxAge; // 최대 나이
}