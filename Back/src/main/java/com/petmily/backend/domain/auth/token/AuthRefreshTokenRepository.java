package com.petmily.backend.domain.auth.token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthRefreshTokenRepository extends JpaRepository<AuthRefreshToken, Long> {
    Optional<AuthRefreshToken> findByToken(String token);
    Optional<AuthRefreshToken> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
