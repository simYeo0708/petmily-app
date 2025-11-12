package com.petmily.backend.api.pet.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.pet.dto.request.PetCreateRequest;
import com.petmily.backend.api.pet.dto.response.PetResponse;
import com.petmily.backend.api.pet.dto.request.PetSearchRequest;
import com.petmily.backend.api.pet.dto.request.PetUpdateRequest;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.pet.repository.PetRepository;
import com.petmily.backend.domain.user.entity.Role;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PetServiceTest {

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PetService petService;

    private User mockUser;
    private Pet mockPet;
    private PetCreateRequest mockCreateRequest;
    private PetUpdateRequest mockUpdateRequest;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .username("testuser")
                .name("테스트 사용자")
                .email("test@example.com")
                .role(Role.USER)
                .build();

        mockPet = new Pet();
        mockPet.setId(1L);
        mockPet.setName("코코");
        mockPet.setSpecies("개");
        mockPet.setBreed("골든 리트리버");
        mockPet.setAge(3);
        mockPet.setGender("수컷");
        mockPet.setPersonality("활발함");
        mockPet.setWeight(25.5);
        mockPet.setSize(Pet.Size.MEDIUM);
        mockPet.setActivityLevel(Pet.ActivityLevel.HIGH);
        mockPet.setIsVaccinated(true);
        mockPet.setGoodWithChildren(true);
        mockPet.setGoodWithOtherPets(true);
        mockPet.setIsNeutered(true);
        mockPet.setUserId(1L);

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
    void createPet_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(petRepository.save(any(Pet.class))).thenReturn(mockPet);

        // When
        PetResponse result = petService.createPet("testuser", mockCreateRequest);

        // Then
        assertThat(result.getName()).isEqualTo("코코");
        assertThat(result.getSpecies()).isEqualTo("개");
        assertThat(result.getBreed()).isEqualTo("골든 리트리버");
        assertThat(result.getAge()).isEqualTo(3);
        verify(petRepository).save(any(Pet.class));
    }

    @Test
    void createPet_UserNotFound() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> petService.createPet("testuser", mockCreateRequest))
                .isInstanceOf(CustomException.class);
    }

    @Test
    void getUserPets_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(petRepository.findByUserIdOrderByCreateTimeDesc(1L))
                .thenReturn(Arrays.asList(mockPet));

        // When
        List<PetResponse> result = petService.getUserPets("testuser");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("코코");
    }

    @Test
    void getPet_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(petRepository.findById(1L)).thenReturn(Optional.of(mockPet));

        // When
        PetResponse result = petService.getPet(1L, "testuser");

        // Then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("코코");
    }

    @Test
    void getPet_NotOwner() {
        // Given
        Pet otherUserPet = new Pet();
        otherUserPet.setId(1L);
        otherUserPet.setUserId(2L); // 다른 사용자의 펫

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(petRepository.findById(1L)).thenReturn(Optional.of(otherUserPet));

        // When & Then
        assertThatThrownBy(() -> petService.getPet(1L, "testuser"))
                .isInstanceOf(CustomException.class);
    }

    @Test
    void updatePet_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(petRepository.findById(1L)).thenReturn(Optional.of(mockPet));
        when(petRepository.save(any(Pet.class))).thenReturn(mockPet);

        // When
        PetResponse result = petService.updatePet(1L, "testuser", mockUpdateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(petRepository).save(any(Pet.class));
    }

    @Test
    void deletePet_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(petRepository.findById(1L)).thenReturn(Optional.of(mockPet));

        // When
        petService.deletePet(1L, "testuser");

        // Then
        verify(petRepository).delete(mockPet);
    }

    @Test
    void searchPets_Success() {
        // Given
        PetSearchRequest searchRequest = new PetSearchRequest();
        searchRequest.setSpecies("개");
        searchRequest.setSize(Pet.Size.MEDIUM);

        Page<Pet> mockPage = new PageImpl<>(Arrays.asList(mockPet));
        when(petRepository.findBySpeciesContainingIgnoreCase(eq("개"), any(Pageable.class)))
                .thenReturn(mockPage);

        // When
        List<PetResponse> result = petService.searchPets(searchRequest, 0, 10);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSpecies()).isEqualTo("개");
        assertThat(result.get(0).getSize()).isEqualTo(Pet.Size.MEDIUM);
    }

    @Test
    void createOnboardingPet_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(petRepository.save(any(Pet.class))).thenReturn(mockPet);

        // When
        PetResponse result = petService.createOnboardingPet(1L, mockCreateRequest);

        // Then
        assertThat(result.getName()).isEqualTo("코코");
        verify(petRepository).save(any(Pet.class));
    }
}