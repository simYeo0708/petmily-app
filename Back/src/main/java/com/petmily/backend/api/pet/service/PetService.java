package com.petmily.backend.api.pet.service;

import com.petmily.backend.api.pet.dto.PetRequest;
import com.petmily.backend.api.pet.dto.PetResponse;
import com.petmily.backend.domain.pet.entity.Pet;
import com.petmily.backend.domain.pet.repository.PetRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PetService {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UserRepository userRepository;

    public PetResponse createPet(Long userId, PetRequest request) {
        System.out.println("🔍 PetService.createPet called with userId: " + userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    System.err.println("❌ User not found with id: " + userId);
                    return new RuntimeException("User not found");
                });

        System.out.println("✅ User found: " + user.getUsername());

        Pet pet = new Pet();
        pet.setUserId(userId);  
        pet.setUser(user);
        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setAge(request.getAge());
        pet.setWeight(request.getWeight());
        pet.setGender(request.getGender());
        pet.setIsNeutered(request.getIsNeutered());
        pet.setDescription(request.getDescription());
        pet.setPhotoUri(request.getPhotoUri());
        pet.setHasPhoto(request.getHasPhoto());
        pet.setTemperaments(request.getTemperaments());
        
        // 건강 및 알레르기 정보
        pet.setIsVaccinated(request.getIsVaccinated());
        pet.setAllergies(request.getAllergies());
        pet.setMedications(request.getMedications());
        pet.setMedicalConditions(request.getMedicalConditions());
        pet.setSpecialNotes(request.getSpecialNotes());

        System.out.println("💾 Saving pet to database...");
        Pet savedPet = petRepository.save(pet);
        System.out.println("✅ Pet created successfully with ID: " + savedPet.getId());
        
        return PetResponse.from(savedPet);
    }

    public PetResponse updatePet(Long userId, Long petId, PetRequest request) {
        Pet pet = petRepository.findByIdAndUserId(petId, userId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setAge(request.getAge());
        pet.setWeight(request.getWeight());
        pet.setGender(request.getGender());
        pet.setIsNeutered(request.getIsNeutered());
        pet.setDescription(request.getDescription());
        pet.setPhotoUri(request.getPhotoUri());
        pet.setHasPhoto(request.getHasPhoto());
        pet.setTemperaments(request.getTemperaments());
        
        // 건강 및 알레르기 정보
        pet.setIsVaccinated(request.getIsVaccinated());
        pet.setAllergies(request.getAllergies());
        pet.setMedications(request.getMedications());
        pet.setMedicalConditions(request.getMedicalConditions());
        pet.setSpecialNotes(request.getSpecialNotes());

        Pet savedPet = petRepository.save(pet);
        return PetResponse.from(savedPet);
    }

    public PetResponse getPet(Long userId, Long petId) {
        Pet pet = petRepository.findByIdAndUserId(petId, userId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        return PetResponse.from(pet);
    }

    public List<PetResponse> getPetsByUserId(Long userId) {
        List<Pet> pets = petRepository.findByUserId(userId);
        return pets.stream()
                .map(PetResponse::from)
                .collect(Collectors.toList());
    }

    public PetResponse getPrimaryPet(Long userId) {
        List<Pet> pets = petRepository.findByUserId(userId);
        if (pets.isEmpty()) {
            return null;
        }
        // 첫 번째 펫을 기본 펫으로 사용
        return PetResponse.from(pets.get(0));
    }

    public void deletePet(Long userId, Long petId) {
        Pet pet = petRepository.findByIdAndUserId(petId, userId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        petRepository.delete(pet);
    }
}