package com.petmily.backend.api.pet.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.pet.dto.request.PetCreateRequest;
import com.petmily.backend.api.pet.dto.response.PetResponse;
import com.petmily.backend.api.pet.dto.request.PetSearchRequest;
import com.petmily.backend.api.pet.dto.request.PetUpdateRequest;
import com.petmily.backend.api.pet.service.PetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        PetResponse response = petService.createPet(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<PetResponse>> getMyPets(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        List<PetResponse> pets = petService.getUserPets(userId);
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/{petId}")
    public ResponseEntity<PetResponse> getPet(
            @PathVariable Long petId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        PetResponse pet = petService.getPet(petId, userId);
        return ResponseEntity.ok(pet);
    }

    @PutMapping("/{petId}")
    public ResponseEntity<PetResponse> updatePet(
            @PathVariable Long petId,
            @RequestBody PetUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        PetResponse response = petService.updatePet(petId, userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletePet(
            @PathVariable Long petId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
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