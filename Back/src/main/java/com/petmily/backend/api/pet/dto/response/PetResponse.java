package com.petmily.backend.api.pet.dto.response;

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
    private Long userId;
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
    
    // Health and medical information
    private String medicalConditions; // 알러지, 질병 등
    private String specialNotes; // 특별 주의사항

    // Timestamps
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    
    // Owner information
    private String ownerUsername;
    private String ownerName;
    
    public static PetResponse from(Pet pet) {
        return PetResponse.builder()
                .id(pet.getId())
                .userId(pet.getUserId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .gender(pet.getGender())
                .personality(pet.getPersonality())
                .imageUrl(pet.getImageUrl())
                .weight(pet.getWeight())
                .size(pet.getSize())
                .medicalConditions(pet.getMedicalConditions())
                .specialNotes(pet.getSpecialNotes())
                .createdTime(pet.getCreatedAt())
                .updatedTime(pet.getUpdatedAt())
                .ownerUsername(pet.getUser() != null ? pet.getUser().getUsername() : null)
                .ownerName(pet.getUser() != null ? pet.getUser().getName() : null)
                .build();
    }
}