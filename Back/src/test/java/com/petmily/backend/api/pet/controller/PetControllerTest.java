package com.petmily.backend.api.pet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmily.backend.api.pet.dto.request.PetCreateRequest;
import com.petmily.backend.api.pet.dto.response.PetResponse;
import com.petmily.backend.api.pet.dto.request.PetUpdateRequest;
import com.petmily.backend.api.pet.service.PetService;
import com.petmily.backend.domain.pet.entity.Pet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PetService petService;

    @Autowired
    private ObjectMapper objectMapper;

    private PetResponse mockPetResponse;
    private PetCreateRequest mockCreateRequest;
    private PetUpdateRequest mockUpdateRequest;

    @BeforeEach
    void setUp() {
        mockPetResponse = PetResponse.builder()
                .id(1L)
                .name("코코")
                .species("개")
                .breed("골든 리트리버")
                .age(3)
                .gender("수컷")
                .personality("활발함")
                .imageUrl("https://example.com/pet.jpg")
                .userId(1L)
                .weight(25.5)
                .size(Pet.Size.MEDIUM)
                .isVaccinated(true)
                .activityLevel(Pet.ActivityLevel.HIGH)
                .goodWithChildren(true)
                .goodWithOtherPets(true)
                .isNeutered(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        mockCreateRequest = new PetCreateRequest();
        mockCreateRequest.setName("코코");
        mockCreateRequest.setSpecies("개");
        mockCreateRequest.setBreed("골든 리트리버");
        mockCreateRequest.setAge(3);
        mockCreateRequest.setGender("수컷");
        mockCreateRequest.setPersonality("활발함");
        mockCreateRequest.setWeight(25.5);
        mockCreateRequest.setSize(Pet.Size.MEDIUM);
        mockCreateRequest.setActivityLevel(Pet.ActivityLevel.HIGH);
        mockCreateRequest.setIsVaccinated(true);
        mockCreateRequest.setGoodWithChildren(true);
        mockCreateRequest.setGoodWithOtherPets(true);
        mockCreateRequest.setIsNeutered(true);

        mockUpdateRequest = new PetUpdateRequest();
        mockUpdateRequest.setName("코코 업데이트");
        mockUpdateRequest.setAge(4);
    }

    @Test
    @WithMockUser(username = "testuser")
    void createPet_Success() throws Exception {
        when(petService.createPet(eq("testuser"), any(PetCreateRequest.class)))
                .thenReturn(mockPetResponse);

        mockMvc.perform(post("/api/pets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockCreateRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("코코"))
                .andExpect(jsonPath("$.species").value("개"))
                .andExpect(jsonPath("$.breed").value("골든 리트리버"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getMyPets_Success() throws Exception {
        List<PetResponse> mockPets = Arrays.asList(mockPetResponse);
        when(petService.getUserPets("testuser")).thenReturn(mockPets);

        mockMvc.perform(get("/api/pets/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("코코"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getPet_Success() throws Exception {
        when(petService.getPet(1L, "testuser")).thenReturn(mockPetResponse);

        mockMvc.perform(get("/api/pets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("코코"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void updatePet_Success() throws Exception {
        PetResponse updatedResponse = PetResponse.builder()
                .id(1L)
                .name("코코 업데이트")
                .age(4)
                .species("개")
                .breed("골든 리트리버")
                .build();

        when(petService.updatePet(eq(1L), eq("testuser"), any(PetUpdateRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/pets/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockUpdateRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("코코 업데이트"))
                .andExpect(jsonPath("$.age").value(4));
    }

    @Test
    @WithMockUser(username = "testuser")
    void deletePet_Success() throws Exception {
        mockMvc.perform(delete("/api/pets/1")
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "testuser")
    void updatePetPhoto_Success() throws Exception {
        String newImageUrl = "https://example.com/updated-pet.jpg";
        PetResponse updatedResponse = PetResponse.builder()
                .id(1L)
                .name("코코")
                .imageUrl(newImageUrl)
                .build();

        when(petService.updatePet(eq(1L), eq("testuser"), any(PetUpdateRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/pets/1/photo")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("\"" + newImageUrl + "\"")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value(newImageUrl));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getPetFittingInfo_Success() throws Exception {
        when(petService.getPet(1L, "testuser")).thenReturn(mockPetResponse);

        mockMvc.perform(get("/api/pets/1/fitting-info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.size").value("MEDIUM"))
                .andExpect(jsonPath("$.breed").value("골든 리트리버"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getPetWalkProfile_Success() throws Exception {
        when(petService.getPet(1L, "testuser")).thenReturn(mockPetResponse);

        mockMvc.perform(get("/api/pets/1/walk-profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activityLevel").value("HIGH"))
                .andExpect(jsonPath("$.goodWithChildren").value(true))
                .andExpect(jsonPath("$.goodWithOtherPets").value(true));
    }
}