package com.petmily.backend.api.pet.dto;

import lombok.Data;

@Data
public class PetRequest {
    private String name;
    private String species;
    private String breed;
    private String age;
    private String weight;
    private String gender;
    private Boolean isNeutered;
    private String description;
    private String photoUri;
    private Boolean hasPhoto;
    private String[] temperaments;
    
    // 건강 및 알레르기 정보 (상품 추천에 활용)
    private Boolean isVaccinated;
    private String[] allergies;        // 알레르기 목록
    private String[] medications;      // 복용 중인 약물
    private String medicalConditions;  // 기존 질병/건강 상태
    private String specialNotes;       // 특별 주의사항
}

