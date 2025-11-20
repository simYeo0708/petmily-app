package com.petmily.backend.api.pet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmily.backend.api.pet.dto.PetRequest;
import com.petmily.backend.api.pet.dto.PetResponse;
import com.petmily.backend.api.pet.service.PetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PetController.class)
@Disabled("Mall 통합 이후 Pet API 테스트 재작성 예정")
class PetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PetService petService;

    @Autowired
    private ObjectMapper objectMapper;

    private PetResponse mockPetResponse;
    private PetRequest mockCreateRequest;
    private PetRequest mockUpdateRequest;

    @BeforeEach
    void setUp() {
        mockPetResponse = new PetResponse();
        mockPetResponse.setId(1L);
        mockPetResponse.setName("코코");
        mockPetResponse.setSpecies("개");
        mockPetResponse.setBreed("골든 리트리버");
        mockPetResponse.setAge("3");
        mockPetResponse.setGender("수컷");
        mockPetResponse.setWeight("25.5");
        mockPetResponse.setIsNeutered(true);
        mockPetResponse.setPhotoUri("https://example.com/pet.jpg");
        mockPetResponse.setHasPhoto(true);
        mockPetResponse.setDescription("활발한 강아지");
        mockPetResponse.setTemperaments(new String[]{"활발함"});

        mockCreateRequest = new PetRequest();
        mockCreateRequest.setName("코코");
        mockCreateRequest.setSpecies("개");
        mockCreateRequest.setBreed("골든 리트리버");
        mockCreateRequest.setAge("3");
        mockCreateRequest.setGender("수컷");
        mockCreateRequest.setWeight("25.5");
        mockCreateRequest.setIsNeutered(true);
        mockCreateRequest.setPhotoUri("https://example.com/pet.jpg");
        mockCreateRequest.setHasPhoto(true);
        mockCreateRequest.setDescription("활발한 강아지");
        mockCreateRequest.setTemperaments(new String[]{"활발함"});

        mockUpdateRequest = new PetRequest();
        mockUpdateRequest.setName("코코 업데이트");
        mockUpdateRequest.setSpecies("개");
        mockUpdateRequest.setBreed("골든 리트리버");
        mockUpdateRequest.setAge("4");
        mockUpdateRequest.setGender("수컷");
        mockUpdateRequest.setWeight("26.0");
        mockUpdateRequest.setIsNeutered(true);
        mockUpdateRequest.setPhotoUri("https://example.com/pet.jpg");
        mockUpdateRequest.setHasPhoto(true);
        mockUpdateRequest.setDescription("활발한 강아지");
        mockUpdateRequest.setTemperaments(new String[]{"활발함"});
    }

    @Test
    @WithMockUser(username = "testuser")
    void createPet_Success() throws Exception {
        when(petService.createPet(eq(1L), any(PetRequest.class)))
                .thenReturn(mockPetResponse);

        mockMvc.perform(post("/api/pets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockCreateRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("코코"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getMyPets_Success() throws Exception {
        List<PetResponse> mockPets = Arrays.asList(mockPetResponse);
        when(petService.getPetsByUserId(1L)).thenReturn(mockPets);

        mockMvc.perform(get("/api/pets/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].name").value("코코"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getPet_Success() throws Exception {
        when(petService.getPet(1L, 1L)).thenReturn(mockPetResponse);

        mockMvc.perform(get("/api/pets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("코코"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void updatePet_Success() throws Exception {
        PetResponse updatedResponse = new PetResponse();
        updatedResponse.setId(1L);
        updatedResponse.setName("코코 업데이트");
        updatedResponse.setSpecies("개");
        updatedResponse.setBreed("골든 리트리버");
        updatedResponse.setAge("4");
        updatedResponse.setGender("수컷");
        updatedResponse.setWeight("26.0");
        updatedResponse.setIsNeutered(true);
        updatedResponse.setPhotoUri("https://example.com/pet.jpg");
        updatedResponse.setHasPhoto(true);
        updatedResponse.setDescription("활발한 강아지");
        updatedResponse.setTemperaments(new String[]{"활발함"});

        when(petService.updatePet(eq(1L), eq(1L), any(PetRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/pets/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockUpdateRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("코코 업데이트"))
                .andExpect(jsonPath("$.age").value("4"));
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
    void getPet_NotFound() throws Exception {
        when(petService.getPet(1L, 1L)).thenThrow(new RuntimeException("Pet not found"));

        mockMvc.perform(get("/api/pets/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "testuser")
    void updatePet_NotFound() throws Exception {
        when(petService.updatePet(eq(1L), eq(1L), any(PetRequest.class)))
                .thenThrow(new RuntimeException("Pet not found"));

        mockMvc.perform(put("/api/pets/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockUpdateRequest))
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }
}