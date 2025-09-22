package com.petmily.backend.api.pet.controller;

import com.petmily.backend.api.pet.dto.PetCreateRequest;
import com.petmily.backend.api.pet.dto.PetResponse;
import com.petmily.backend.api.pet.dto.PetSearchRequest;
import com.petmily.backend.api.pet.dto.PetUpdateRequest;
import com.petmily.backend.api.pet.service.PetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;

    @PostMapping
    public ResponseEntity<PetResponse> createPet(
            @RequestBody PetCreateRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        PetResponse response = petService.createPet(username, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<PetResponse>> getMyPets(Authentication authentication) {
        String username = authentication.getName();
        List<PetResponse> pets = petService.getUserPets(username);
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/{petId}")
    public ResponseEntity<PetResponse> getPet(
            @PathVariable Long petId,
            Authentication authentication) {
        String username = authentication.getName();
        PetResponse pet = petService.getPet(petId, username);
        return ResponseEntity.ok(pet);
    }

    @PutMapping("/{petId}")
    public ResponseEntity<PetResponse> updatePet(
            @PathVariable Long petId,
            @RequestBody PetUpdateRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        PetResponse response = petService.updatePet(petId, username, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletePet(
            @PathVariable Long petId,
            Authentication authentication) {
        String username = authentication.getName();
        petService.deletePet(petId, username);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<PetResponse>> searchPets(
            @ModelAttribute PetSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<PetResponse> pets = petService.searchPets(searchRequest, page, size);
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PetResponse>> getAllPets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<PetResponse> pets = petService.getAllPets(page, size);
        return ResponseEntity.ok(pets);
    }

    @PutMapping("/{petId}/photo")
    public ResponseEntity<PetResponse> updatePetPhoto(
            @PathVariable Long petId,
            @RequestBody String imageUrl,
            Authentication authentication) {
        String username = authentication.getName();
        
        PetUpdateRequest request = new PetUpdateRequest();
        request.setImageUrl(imageUrl);
        
        PetResponse response = petService.updatePet(petId, username, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/onboarding/{userId}")
    public ResponseEntity<PetResponse> createOnboardingPet(
            @PathVariable Long userId,
            @RequestBody PetCreateRequest request) {
        PetResponse response = petService.createOnboardingPet(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 반려동물 의상 가상 착용 체험 정보 조회 (AI 서비스용)
     */
    @GetMapping("/{petId}/fitting-info")
    public ResponseEntity<PetResponse> getPetFittingInfo(
            @PathVariable Long petId,
            Authentication authentication) {
        String username = authentication.getName();
        PetResponse pet = petService.getPet(petId, username);
        
        return ResponseEntity.ok(pet);
    }

    /**
     * 산책 매칭용 반려동물 정보 조회
     */
    @GetMapping("/{petId}/walk-profile")
    public ResponseEntity<PetResponse> getPetWalkProfile(
            @PathVariable Long petId,
            Authentication authentication) {
        String username = authentication.getName();
        PetResponse pet = petService.getPet(petId, username);
        
        return ResponseEntity.ok(pet);
    }
}