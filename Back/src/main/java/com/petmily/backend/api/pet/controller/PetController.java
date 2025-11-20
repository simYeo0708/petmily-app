package com.petmily.backend.api.pet.controller;

import com.petmily.backend.api.pet.dto.PetRequest;
import com.petmily.backend.api.pet.dto.PetResponse;
import com.petmily.backend.api.pet.service.PetService;
import com.petmily.backend.api.auth.jwt.JwtTokenProvider;
import com.petmily.backend.domain.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pets")
@CrossOrigin(origins = "*")
public class PetController {

    @Autowired
    private PetService petService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private UserRepository userRepository;
    
    // SecurityContext에서 현재 사용자 ID 가져오기
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            try {
                // 먼저 숫자로 파싱 시도 (userId인 경우)
                return Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                // 파싱 실패 시 username이므로 데이터베이스에서 조회
                String username = authentication.getName();
                System.out.println("🔍 Getting userId for username: " + username);
                return userRepository.findByUsername(username)
                    .map(user -> {
                        System.out.println("✅ Found user: id=" + user.getId() + ", username=" + user.getUsername());
                        return user.getId();
                    })
                    .orElseGet(() -> {
                        System.err.println("❌ User not found for username: " + username);
                        return null;
                    });
            }
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<PetResponse> createPet(@RequestBody PetRequest request) {
        try {
            System.out.println("====================================");
            System.out.println("📝 CREATE PET REQUEST RECEIVED");
            System.out.println("Pet Name: " + request.getName());
            System.out.println("Species: " + request.getSpecies());
            System.out.println("Breed: " + request.getBreed());
            System.out.println("====================================");
            
            Long userId = getCurrentUserId();
            System.out.println("Current User ID: " + userId);
            
            if (userId == null) {
                System.err.println("❌ User ID is null - Unauthorized");
                return ResponseEntity.status(401).build();
            }
            
            System.out.println("✅ User ID obtained: " + userId);
            System.out.println("Calling petService.createPet...");
            
            PetResponse response = petService.createPet(userId, request);
            
            System.out.println("✅ Pet created successfully!");
            System.out.println("Pet ID: " + response.getId());
            System.out.println("Pet Name: " + response.getName());
            System.out.println("====================================");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("====================================");
            System.err.println("❌ ERROR CREATING PET");
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("Error Message: " + e.getMessage());
            System.err.println("====================================");
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{petId}")
    public ResponseEntity<PetResponse> updatePet(@PathVariable Long petId,
                                                @RequestBody PetRequest request) {
        try {
            System.out.println("Updating pet with ID: " + petId);
            System.out.println("Request data: " + request);
            
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            System.out.println("User ID: " + userId);
            
            PetResponse response = petService.updatePet(userId, petId, request);
            System.out.println("Pet updated successfully with ID: " + response.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error updating pet: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{petId}")
    public ResponseEntity<PetResponse> getPet(@PathVariable Long petId) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            PetResponse response = petService.getPet(userId, petId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<PetResponse>> getPets() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            List<PetResponse> responses = petService.getPetsByUserId(userId);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/primary")
    public ResponseEntity<PetResponse> getPrimaryPet() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                System.err.println("User ID is null - not authenticated");
                return ResponseEntity.status(401).build();
            }
            System.out.println("Getting primary pet for user ID: " + userId);
            PetResponse response = petService.getPrimaryPet(userId);
            if (response == null) {
                System.out.println("No primary pet found for user ID: " + userId);
                return ResponseEntity.notFound().build();
            }
            System.out.println("Primary pet found: " + response.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error getting primary pet: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // 공개 API - 인증 없이 접근 가능 (개발용)
    @GetMapping("/public/primary")
    public ResponseEntity<PetResponse> getPrimaryPetPublic() {
        try {
            // 개발용: 첫 번째 사용자의 첫 번째 펫 반환
            PetResponse response = petService.getPrimaryPet(1L); // 하드코딩된 사용자 ID
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error getting primary pet (public): " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletePet(@PathVariable Long petId) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            petService.deletePet(userId, petId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}