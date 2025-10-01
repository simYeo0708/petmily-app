package com.petmily.backend.domain.walker.repository;

import com.petmily.backend.domain.walker.entity.FavoriteWalker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteWalkerRepository extends JpaRepository<FavoriteWalker, Long> {

    List<FavoriteWalker> findByUserIdAndIsActiveTrueOrderByCreateTimeDesc(Long userId);

    Optional<FavoriteWalker> findByUserIdAndWalkerIdAndIsActiveTrue(Long userId, Long walkerId);

    boolean existsByUserIdAndWalkerIdAndIsActiveTrue(Long userId, Long walkerId);

}