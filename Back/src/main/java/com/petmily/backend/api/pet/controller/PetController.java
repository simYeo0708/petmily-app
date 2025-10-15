package com.petmily.backend.api.pet.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
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
        Long userId = SecurityUtils.getUserId(authentication);
        PetResponse response = petService.createPet(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<PetResponse>> getMyPets(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<PetResponse> pets = petService.getUserPets(userId);
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/{petId}")
    public ResponseEntity<PetResponse> getPet(
            @PathVariable Long petId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        PetResponse pet = petService.getPet(petId, userId);
        return ResponseEntity.ok(pet);
    }

    @PutMapping("/{petId}")
    public ResponseEntity<PetResponse> updatePet(
            @PathVariable Long petId,
            @RequestBody PetUpdateRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        PetResponse response = petService.updatePet(petId, userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletePet(
            @PathVariable Long petId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        petService.deletePet(petId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<PetResponse>> searchPets(
            @ModelAttribute PetSearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<PetResponse> pets = petService.searchPets(request, page, size);
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PetResponse>> getAllPets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<PetResponse> pets = petService.getAllPets(page, size);
        return ResponseEntity.ok(pets);
    }

}