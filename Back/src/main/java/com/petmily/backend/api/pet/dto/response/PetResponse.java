package com.petmily.backend.api.pet.dto;

import lombok.Data;

@Data
public class PetResponse {
    private Long id;
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
    
    // 건강 및 알레르기 정보
    private Boolean isVaccinated;
    private String[] allergies;        // 알레르기 목록
    private String[] medications;      // 복용 중인 약물
    private String medicalConditions;  // 기존 질병/건강 상태
    private String specialNotes;       // 특별 주의사항

    public static PetResponse from(com.petmily.backend.domain.pet.entity.Pet pet) {
        PetResponse response = new PetResponse();
        response.setId(pet.getId());
        response.setName(pet.getName());
        response.setSpecies(pet.getSpecies());
        response.setBreed(pet.getBreed());
        response.setAge(pet.getAge());
        response.setWeight(pet.getWeight());
        response.setGender(pet.getGender());
        response.setIsNeutered(pet.getIsNeutered());
        response.setDescription(pet.getDescription());
        response.setPhotoUri(pet.getPhotoUri());
        response.setHasPhoto(pet.getHasPhoto());
        response.setTemperaments(pet.getTemperaments());
        
        // 건강 및 알레르기 정보
        response.setIsVaccinated(pet.getIsVaccinated());
        response.setAllergies(pet.getAllergies());
        response.setMedications(pet.getMedications());
        response.setMedicalConditions(pet.getMedicalConditions());
        response.setSpecialNotes(pet.getSpecialNotes());
        
        return response;
    }
}