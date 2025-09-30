package com.petmily.backend.domain.pet.repository;

import com.petmily.backend.domain.pet.entity.Pet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    
    List<Pet> findByUserId(Long userId);
    
    List<Pet> findByUserIdOrderByCreateTimeDesc(Long userId);
    
    Page<Pet> findBySpeciesContainingIgnoreCase(String species, Pageable pageable);
    
}

