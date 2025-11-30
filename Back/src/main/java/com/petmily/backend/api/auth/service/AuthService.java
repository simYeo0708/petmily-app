package com.petmily.backend.api.auth.service;

import com.petmily.backend.api.auth.dto.request.LoginRequest;
import com.petmily.backend.api.auth.dto.request.SignupRequest;
import com.petmily.backend.api.auth.dto.response.TokenResponse;
import com.petmily.backend.api.auth.exception.TokenException;
import com.petmily.backend.api.auth.jwt.JwtTokenProvider;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.auth.entity.AuthRefreshToken;
import com.petmily.backend.domain.auth.repository.AuthRefreshTokenRepository;
import com.petmily.backend.config.DevTestUserProperties;
import com.petmily.backend.domain.user.entity.Role;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Objects;

@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthRefreshTokenRepository refreshTokenRepository;
    private final DevTestUserProperties devTestUserProperties;

    public AuthService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder,
                      JwtTokenProvider jwtTokenProvider,
                      AuthRefreshTokenRepository refreshTokenRepository,
                      DevTestUserProperties devTestUserProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenRepository = refreshTokenRepository;
        this.devTestUserProperties = devTestUserProperties;
    }

    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists.");
        }

        User newUser = Objects.requireNonNull(
                User.builder()
                        .username(request.getUsername())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .email(request.getEmail())
                        .name(request.getName())
                        .role(Role.USER)
                        .build(),
                "User builder returned null"
        );

        userRepository.save(newUser);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        log.info("로그인 시도: username={}", request.getUsername());
        
        try {
            // 사용자 조회
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> {
                        log.error("❌ 사용자를 찾을 수 없음: {}", request.getUsername());
                        return new UsernameNotFoundException("User not found");
                    });
            
            log.info("✅ 사용자 조회 성공: userId={}, username={}", user.getId(), user.getUsername());
            
            // 비밀번호 확인
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.error("❌ 비밀번호 불일치: username={}", request.getUsername());
                throw new org.springframework.security.authentication.BadCredentialsException("Invalid password");
            }
            
            log.info("✅ 비밀번호 일치");
            
            // Authentication 객체 생성
            org.springframework.security.core.authority.SimpleGrantedAuthority authority = 
                new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole().getKey());
            org.springframework.security.core.userdetails.User userDetails = 
                new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPassword(),
                    java.util.Collections.singletonList(authority)
                );
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                java.util.Collections.singletonList(authority)
            );

            log.info("✅ 인증 객체 생성 성공: {}", authentication.getName());

            String accessToken = jwtTokenProvider.generateAccessToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);
            
            log.info("✅ 토큰 생성 성공");

            Long userId = user.getId();
            refreshTokenRepository.findByUserId(userId)
                    .ifPresentOrElse(
                            token -> {
                                token.updateToken(refreshToken, Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiration()));
                                refreshTokenRepository.save(token);
                                log.info("✅ Refresh token 업데이트 완료");
                            },
                            () -> {
                                AuthRefreshToken newRefreshToken = Objects.requireNonNull(
                                        AuthRefreshToken.builder()
                                                .token(refreshToken)
                                                .userId(userId)
                                                .expirationDate(Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiration()))
                                                .build(),
                                        "AuthRefreshToken builder returned null"
                                );
                                refreshTokenRepository.save(newRefreshToken);
                                log.info("✅ 새 Refresh token 생성 완료");
                            }
                    );

            log.info("✅ 로그인 완료");
            
            return TokenResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .build();
        } catch (Exception e) {
            log.error("❌ 로그인 실패: username={}, error={}", request.getUsername(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public TokenResponse reissue(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new TokenException(ErrorCode.INVALID_TOKEN);
        }

        Authentication authentication = jwtTokenProvider.getAuthentication(refreshToken);

        AuthRefreshToken storedRefreshToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new TokenException(ErrorCode.TOKEN_EXPIRED));

        String newAccessToken = jwtTokenProvider.generateAccessToken(authentication);

        String newRefreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        storedRefreshToken.updateToken(newRefreshToken, Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiration()));
        refreshTokenRepository.save(storedRefreshToken);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    @Transactional
    public void withdraw(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        refreshTokenRepository.findByUserId(user.getId())
                .ifPresent(refreshTokenRepository::delete);

        userRepository.delete(user);
    }

    @Transactional
    public User ensureDevTestUser() {
        String username = devTestUserProperties.getUsername();
        if (username == null || username.isBlank()) {
            throw new IllegalStateException("Dev test user username must be configured.");
        }

        java.util.Optional<User> existingUser = userRepository.findByUsername(username);
        User result = existingUser.isPresent()
                ? refreshDevTestUser(existingUser.get())
                : createDevTestUser();

        if (result == null) {
            throw new IllegalStateException("Dev test user could not be ensured.");
        }
        return result;
    }

    private User refreshDevTestUser(User existingUser) {
        boolean updated = false;

        String rawPassword = devTestUserProperties.getPassword();
        if (rawPassword != null && !rawPassword.isBlank() &&
                !passwordEncoder.matches(rawPassword, existingUser.getPassword())) {
            existingUser.setPassword(passwordEncoder.encode(rawPassword));
            updated = true;
        }

        String email = devTestUserProperties.getEmail();
        if (email != null && !email.isBlank() && !email.equals(existingUser.getEmail())) {
            existingUser.setEmail(email);
            updated = true;
        }

        String name = devTestUserProperties.getName();
        if (name != null && !name.isBlank() && !name.equals(existingUser.getName())) {
            existingUser.setName(name);
            updated = true;
        }

        // asdf 계정은 관리자(ADMIN) 권한으로 설정
        if (existingUser.getRole() == null || !existingUser.getRole().equals(Role.ADMIN)) {
            existingUser.setRole(Role.ADMIN);
            updated = true;
        }

        if (updated) {
            return Objects.requireNonNull(
                    userRepository.save(existingUser),
                    "Failed to persist dev test user updates."
            );
        }
        return Objects.requireNonNull(existingUser, "Existing user must not be null");
    }

    private User createDevTestUser() {
        String username = devTestUserProperties.getUsername();
        String password = devTestUserProperties.getPassword();
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalStateException("Dev test user credentials must be configured.");
        }

        User newUser = Objects.requireNonNull(
                User.builder()
                        .username(username)
                        .password(passwordEncoder.encode(password))
                        .email(devTestUserProperties.getEmail())
                        .name(devTestUserProperties.getName())
                        .role(Role.ADMIN) // asdf 계정은 관리자 권한으로 설정
                        .build(),
                "User builder returned null"
        );

        return Objects.requireNonNull(
                userRepository.save(newUser),
                "Failed to create dev test user."
        );
    }
    
    // 🔧 개발용: 모든 사용자 조회
    public java.util.List<java.util.Map<String, Object>> getAllUsersForDebug() {
        return userRepository.findAll().stream()
                .map(user -> {
                    java.util.Map<String, Object> userMap = new java.util.HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("username", user.getUsername() != null ? user.getUsername() : "null");
                    userMap.put("email", user.getEmail() != null ? user.getEmail() : "null");
                    userMap.put("name", user.getName() != null ? user.getName() : "null");
                    userMap.put("role", user.getRole() != null ? user.getRole().toString() : "null");
                    userMap.put("hasPassword", user.getPassword() != null && !user.getPassword().isEmpty());
                    return userMap;
                })
                .collect(java.util.stream.Collectors.toList());
    }
}