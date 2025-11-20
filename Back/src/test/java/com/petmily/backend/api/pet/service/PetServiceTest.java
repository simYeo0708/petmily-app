package com.petmily.backend.api.pet.service;

import com.petmily.backend.api.pet.dto.PetRequest;
import com.petmily.backend.api.pet.dto.PetResponse;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.pet.repository.PetRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@Disabled("Mall 구조 편입으로 PetService 로직 재검토 예정")
class PetServiceTest {

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PetService petService;

    private Pet mockPet;
    private User mockUser;
    private PetRequest mockCreateRequest;
    private PetRequest mockUpdateRequest;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .build();

        mockPet = new Pet();
        mockPet.setId(1L);
        mockPet.setName("코코");
        mockPet.setSpecies("개");
        mockPet.setBreed("골든 리트리버");
        mockPet.setAge("3");
        mockPet.setGender("수컷");
        mockPet.setWeight("25.5");
        mockPet.setIsNeutered(true);
        mockPet.setPhotoUri("https://example.com/pet.jpg");
        mockPet.setHasPhoto(true);
        mockPet.setDescription("활발한 강아지");
        mockPet.setTemperaments(new String[]{"활발함"});
        mockPet.setUser(mockUser);

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
    void createPet_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(petRepository.save(any(Pet.class))).thenReturn(mockPet);

        // When
        PetResponse result = petService.createPet(1L, mockCreateRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("코코");
        assertThat(result.getSpecies()).isEqualTo("개");
        assertThat(result.getAge()).isEqualTo("3");
        verify(petRepository).save(any(Pet.class));
    }

    @Test
    void createPet_UserNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> petService.createPet(1L, mockCreateRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    void getUserPets_Success() {
        // Given
        List<Pet> mockPets = Arrays.asList(mockPet);
        when(petRepository.findByUserId(1L)).thenReturn(mockPets);

        // When
        List<PetResponse> result = petService.getPetsByUserId(1L);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("코코");
        verify(petRepository).findByUserId(1L);
    }

    @Test
    void getPet_Success() {
        // Given
        when(petRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(mockPet));

        // When
        PetResponse result = petService.getPet(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("코코");
        verify(petRepository).findByIdAndUserId(1L, 1L);
    }

    @Test
    void getPet_NotFound() {
        // Given
        when(petRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> petService.getPet(1L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Pet not found");
    }

    @Test
    void updatePet_Success() {
        // Given
        when(petRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(mockPet));
        when(petRepository.save(any(Pet.class))).thenReturn(mockPet);

        // When
        PetResponse result = petService.updatePet(1L, 1L, mockUpdateRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("코코");
        verify(petRepository).save(any(Pet.class));
    }

    @Test
    void deletePet_Success() {
        // Given
        when(petRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(mockPet));

        // When
        petService.deletePet(1L, 1L);

        // Then
        verify(petRepository).delete(mockPet);
    }
}