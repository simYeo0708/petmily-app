package com.petmily.backend.domain.pet.repository;

import com.petmily.backend.domain.pet.entity.Pet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    
    List<Pet> findByUserId(Long userId);
    
    List<Pet> findByUserIdOrderByCreateTimeDesc(Long userId);
    
    Page<Pet> findBySpeciesContainingIgnoreCase(String species, Pageable pageable);
    
    List<Pet> findBySpecies(String species);
    
    List<Pet> findByBreedContainingIgnoreCase(String breed);
    
    List<Pet> findBySize(Pet.Size size);
    
    List<Pet> findByActivityLevel(Pet.ActivityLevel activityLevel);
    
    @Query("SELECT p FROM Pet p WHERE p.age BETWEEN :minAge AND :maxAge")
    List<Pet> findByAgeBetween(@Param("minAge") Integer minAge, @Param("maxAge") Integer maxAge);
    
}

