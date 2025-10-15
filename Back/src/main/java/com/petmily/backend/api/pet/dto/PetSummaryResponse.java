package com.petmily.backend.api.pet.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.petmily.backend.domain.pet.entity.Pet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(builder = PetSummaryResponse.PetSummaryResponseBuilder.class)
public class PetSummaryResponse {
    private Long id;
    private String name;
    private String species;
    private String breed;
    private String age;
    private String imageUrl;
    private Pet.Size size;
    
    public static PetSummaryResponse from(Pet pet) {
        return PetSummaryResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .imageUrl(pet.getPhotoUri())
                .size(pet.getSize())
                .build();
    }
}