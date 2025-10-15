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

    private User findUserById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    private Pet findPetById(Long petId){
        return petRepository.findById(petId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "애완동물을 찾을 수 없습니다."));
    }

    @Transactional
    public PetResponse createPet(Long userId, PetCreateRequest request) {
        User user = findUserById(userId);

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
        pet.setMedicalConditions(request.getMedicalConditions());
        pet.setSpecialNotes(request.getSpecialNotes());
        pet.setUserId(user.getId());

        Pet savedPet = petRepository.save(pet);
        return PetResponse.from(savedPet);
    }

    public List<PetResponse> getUserPets(Long userId) {
        User user = findUserById(userId);

        List<Pet> pets = petRepository.findByUserIdOrderByCreateTimeDesc(user.getId());
        return pets.stream()
                .map(PetResponse::from)
                .collect(Collectors.toList());
    }

    public PetResponse getPet(Long petId, Long userId) {
        User user = findUserById(userId);
        Pet pet = findPetById(petId);

        if (!pet.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "자신의 애완동물만 조회 가능합니다.");
        }

        return PetResponse.from(pet);
    }

    @Transactional
    public PetResponse updatePet(Long petId, Long userId, PetUpdateRequest request) {
        User user = findUserById(userId);
        Pet pet = findPetById(petId);

        if (!pet.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "자신의 애완동물의 정보만 수정 가능합니다.");
        }

        if (request.getName() != null) pet.setName(request.getName());
        if (request.getSpecies() != null) pet.setSpecies(request.getSpecies());
        if (request.getBreed() != null) pet.setBreed(request.getBreed());
        if (request.getAge() != null) pet.setAge(request.getAge());
        if (request.getGender() != null) pet.setGender(request.getGender());
        if (request.getPersonality() != null) pet.setPersonality(request.getPersonality());
        if (request.getImageUrl() != null) pet.setImageUrl(request.getImageUrl());
        if (request.getWeight() != null) pet.setWeight(request.getWeight());
        if (request.getSize() != null) pet.setSize(request.getSize());
        if (request.getMedicalConditions() != null) pet.setMedicalConditions(request.getMedicalConditions());
        if (request.getSpecialNotes() != null) pet.setSpecialNotes(request.getSpecialNotes());

        Pet updatedPet = petRepository.save(pet);
        return PetResponse.from(updatedPet);
    }

    @Transactional
    public void deletePet(Long petId, Long userId) {
        User user = findUserById(userId);
        Pet pet = findPetById(petId);

        if (!pet.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "당신의 애완동물만 지울 수 있습니다.");
        }

        petRepository.delete(pet);
    }

    public List<PetResponse> searchPets(PetSearchRequest request, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        
        Page<Pet> pets;
        
        if (request.getSpecies() != null) {
            pets = petRepository.findBySpeciesContainingIgnoreCase(request.getSpecies(), pageable);
        } else {
            pets = petRepository.findAll(pageable);
        }

        return pets.getContent().stream()
                .filter(pet -> matchesSearchCriteria(pet, request))
                .map(PetResponse::from)
                .collect(Collectors.toList());
    }

    private boolean matchesSearchCriteria(Pet pet, PetSearchRequest request) {
        if (request.getBreed() != null &&
            (pet.getBreed() == null || !pet.getBreed().toLowerCase().contains(request.getBreed().toLowerCase()))) {
            return false;
        }
        
        if (request.getSize() != null && !request.getSize().equals(pet.getSize())) {
            return false;
        }

        if (request.getMinAge() != null && (pet.getAge() == null || pet.getAge() < request.getMinAge())) {
            return false;
        }
        
        if (request.getMaxAge() != null && (pet.getAge() == null || pet.getAge() > request.getMaxAge())) {
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

}