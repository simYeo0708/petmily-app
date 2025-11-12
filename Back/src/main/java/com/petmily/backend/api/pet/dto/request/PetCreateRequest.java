package com.petmily.backend.api.pet.dto.request;

import com.petmily.backend.domain.pet.entity.Pet;
import lombok.Data;

@Data
public class PetCreateRequest {
    private String name;
    private String species; // 개, 고양이 등
    private String breed; // 품종
    private Integer age;
    private String gender; // 수컷, 암컷
    private String personality; // 성격
    private String imageUrl;
    
    // Weight and size information
    private Double weight; // kg
    private Pet.Size size; // SMALL, MEDIUM, LARGE
    
    private String medicalConditions; // 알러지, 질병 등
    private String specialNotes; // 특별 주의사항
}