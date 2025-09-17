package com.petmily.backend.api.pet.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import com.petmily.backend.domain.pet.entity.Pet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(builder = PetResponse.PetResponseBuilder.class)
public class PetResponse {
    
    @JsonPOJOBuilder(withPrefix = "")
    public static class PetResponseBuilder {
    }
    private Long id;
    private String name;
    private String species; // 개, 고양이 등
    private String breed; // 품종
    private Integer age;
    private String gender; // 수컷, 암컷
    private String personality; // 성격
    private String imageUrl;
    private Long userId;
    
    // Weight and size information
    private Double weight; // kg
    private Pet.Size size; // SMALL, MEDIUM, LARGE
    
    // Health and medical information
    private Boolean isVaccinated;
    private String medicalConditions; // 알러지, 질병 등
    private String specialNotes; // 특별 주의사항
    
    // Activity level and preferences
    private Pet.ActivityLevel activityLevel; // LOW, MODERATE, HIGH
    private String favoriteActivities; // 좋아하는 활동들
    
    // Social behavior
    private Boolean goodWithChildren;
    private Boolean goodWithOtherPets;
    private Boolean isNeutered;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Owner information
    private String ownerUsername;
    private String ownerName;
    
    public static PetResponse from(Pet pet) {
        return PetResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .gender(pet.getGender())
                .personality(pet.getPersonality())
                .imageUrl(pet.getImageUrl())
                .userId(pet.getUserId())
                .weight(pet.getWeight())
                .size(pet.getSize())
                .isVaccinated(pet.getIsVaccinated())
                .medicalConditions(pet.getMedicalConditions())
                .specialNotes(pet.getSpecialNotes())
                .activityLevel(pet.getActivityLevel())
                .favoriteActivities(pet.getFavoriteActivities())
                .goodWithChildren(pet.getGoodWithChildren())
                .goodWithOtherPets(pet.getGoodWithOtherPets())
                .isNeutered(pet.getIsNeutered())
                .createdAt(pet.getCreateTime())
                .updatedAt(pet.getUpdateTime())
                .ownerUsername(pet.getUser() != null ? pet.getUser().getUsername() : null)
                .ownerName(pet.getUser() != null ? pet.getUser().getName() : null)
                .build();
    }
}