package com.petmily.backend.domain.auth.token;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "refresh_token")
public class AuthRefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Long userId; // Assuming userId is a Long, adjust if User entity uses a different type

    @Column(nullable = false)
    private Instant expirationDate;

    public void updateToken(String token, Instant expirationDate) {
        this.token = token;
        this.expirationDate = expirationDate;
    }
}
