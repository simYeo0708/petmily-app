package com.petmily.backend.api.pet.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.pet.dto.PetCreateRequest;
import com.petmily.backend.api.pet.dto.PetResponse;
import com.petmily.backend.api.pet.dto.PetSearchRequest;
import com.petmily.backend.api.pet.dto.PetUpdateRequest;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.pet.repository.PetRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;

    @Transactional
    public PetResponse createPet(String username, PetCreateRequest request) {
        // Get user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // Create pet
        Pet pet = new Pet();
        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setAge(request.getAge());
        pet.setGender(request.getGender());
        pet.setPersonality(request.getPersonality());
        pet.setImageUrl(request.getImageUrl());
        pet.setWeight(request.getWeight());
        pet.setSize(request.getSize());
        pet.setIsVaccinated(request.getIsVaccinated());
        pet.setMedicalConditions(request.getMedicalConditions());
        pet.setSpecialNotes(request.getSpecialNotes());
        pet.setActivityLevel(request.getActivityLevel());
        pet.setFavoriteActivities(request.getFavoriteActivities());
        pet.setGoodWithChildren(request.getGoodWithChildren());
        pet.setGoodWithOtherPets(request.getGoodWithOtherPets());
        pet.setIsNeutered(request.getIsNeutered());
        pet.setUserId(user.getId());

        Pet savedPet = petRepository.save(pet);
        return PetResponse.from(savedPet);
    }

    public List<PetResponse> getUserPets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<Pet> pets = petRepository.findByUserIdOrderByCreateTimeDesc(user.getId());
        return pets.stream()
                .map(PetResponse::from)
                .collect(Collectors.toList());
    }

    public PetResponse getPet(Long petId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "애완동물을 찾을 수 없습니다."));

        // Check if user owns this pet
        if (!pet.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "자신의 애완동물만 조회 가능합니다.");
        }

        return PetResponse.from(pet);
    }

    @Transactional
    public PetResponse updatePet(Long petId, String username, PetUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "애완동물을 찾을 수 없습니다."));

        // Check if user owns this pet
        if (!pet.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "자신의 애완동물의 정보만 수정 가능합니다.");
        }

        // Update pet information
        if (request.getName() != null) pet.setName(request.getName());
        if (request.getSpecies() != null) pet.setSpecies(request.getSpecies());
        if (request.getBreed() != null) pet.setBreed(request.getBreed());
        if (request.getAge() != null) pet.setAge(request.getAge());
        if (request.getGender() != null) pet.setGender(request.getGender());
        if (request.getPersonality() != null) pet.setPersonality(request.getPersonality());
        if (request.getImageUrl() != null) pet.setImageUrl(request.getImageUrl());
        if (request.getWeight() != null) pet.setWeight(request.getWeight());
        if (request.getSize() != null) pet.setSize(request.getSize());
        if (request.getIsVaccinated() != null) pet.setIsVaccinated(request.getIsVaccinated());
        if (request.getMedicalConditions() != null) pet.setMedicalConditions(request.getMedicalConditions());
        if (request.getSpecialNotes() != null) pet.setSpecialNotes(request.getSpecialNotes());
        if (request.getActivityLevel() != null) pet.setActivityLevel(request.getActivityLevel());
        if (request.getFavoriteActivities() != null) pet.setFavoriteActivities(request.getFavoriteActivities());
        if (request.getGoodWithChildren() != null) pet.setGoodWithChildren(request.getGoodWithChildren());
        if (request.getGoodWithOtherPets() != null) pet.setGoodWithOtherPets(request.getGoodWithOtherPets());
        if (request.getIsNeutered() != null) pet.setIsNeutered(request.getIsNeutered());

        Pet updatedPet = petRepository.save(pet);
        return PetResponse.from(updatedPet);
    }

    @Transactional
    public void deletePet(Long petId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "애완동물을 찾을 수 없습니다."));

        // Check if user owns this pet
        if (!pet.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "당신의 애완동물만 지울 수 있습니다.");
        }

        petRepository.delete(pet);
    }

    public List<PetResponse> searchPets(PetSearchRequest searchRequest, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        
        // For now, implement basic filtering. In real application, you might want to use 
        // Specification or custom queries for complex filtering
        Page<Pet> pets;
        
        if (searchRequest.getSpecies() != null) {
            pets = petRepository.findBySpeciesContainingIgnoreCase(searchRequest.getSpecies(), pageable);
        } else {
            pets = petRepository.findAll(pageable);
        }

        return pets.getContent().stream()
                .filter(pet -> matchesSearchCriteria(pet, searchRequest))
                .map(PetResponse::from)
                .collect(Collectors.toList());
    }

    private boolean matchesSearchCriteria(Pet pet, PetSearchRequest searchRequest) {
        if (searchRequest.getBreed() != null && 
            (pet.getBreed() == null || !pet.getBreed().toLowerCase().contains(searchRequest.getBreed().toLowerCase()))) {
            return false;
        }
        
        if (searchRequest.getSize() != null && !searchRequest.getSize().equals(pet.getSize())) {
            return false;
        }
        
        if (searchRequest.getActivityLevel() != null && !searchRequest.getActivityLevel().equals(pet.getActivityLevel())) {
            return false;
        }
        
        if (searchRequest.getGoodWithChildren() != null && !searchRequest.getGoodWithChildren().equals(pet.getGoodWithChildren())) {
            return false;
        }
        
        if (searchRequest.getGoodWithOtherPets() != null && !searchRequest.getGoodWithOtherPets().equals(pet.getGoodWithOtherPets())) {
            return false;
        }
        
        if (searchRequest.getMinAge() != null && (pet.getAge() == null || pet.getAge() < searchRequest.getMinAge())) {
            return false;
        }
        
        if (searchRequest.getMaxAge() != null && (pet.getAge() == null || pet.getAge() > searchRequest.getMaxAge())) {
            return false;
        }
        
        return true;
    }

    public List<PetResponse> getAllPets(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<Pet> pets = petRepository.findAll(pageable);
        
        return pets.getContent().stream()
                .map(PetResponse::from)
                .collect(Collectors.toList());
    }

    // Method for onboarding - create pet during user registration process
    @Transactional
    public PetResponse createOnboardingPet(Long userId, PetCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Pet pet = new Pet();
        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setAge(request.getAge());
        pet.setGender(request.getGender());
        pet.setPersonality(request.getPersonality());
        pet.setImageUrl(request.getImageUrl());
        pet.setWeight(request.getWeight());
        pet.setSize(request.getSize());
        pet.setIsVaccinated(request.getIsVaccinated());
        pet.setMedicalConditions(request.getMedicalConditions());
        pet.setSpecialNotes(request.getSpecialNotes());
        pet.setActivityLevel(request.getActivityLevel());
        pet.setFavoriteActivities(request.getFavoriteActivities());
        pet.setGoodWithChildren(request.getGoodWithChildren());
        pet.setGoodWithOtherPets(request.getGoodWithOtherPets());
        pet.setIsNeutered(request.getIsNeutered());
        pet.setUserId(userId);

        Pet savedPet = petRepository.save(pet);
        return PetResponse.from(savedPet);
    }
}