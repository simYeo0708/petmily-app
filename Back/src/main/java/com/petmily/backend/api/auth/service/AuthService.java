package com.petmily.backend.api.auth.service;

import com.petmily.backend.api.auth.dto.request.LoginRequest;
import com.petmily.backend.api.auth.dto.request.SignupRequest;
import com.petmily.backend.api.auth.dto.response.TokenResponse;
import com.petmily.backend.api.auth.exception.TokenException;
import com.petmily.backend.api.auth.jwt.JwtTokenProvider;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.auth.token.AuthRefreshToken;
import com.petmily.backend.domain.auth.token.AuthRefreshTokenRepository;
import com.petmily.backend.domain.user.entity.Role;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.security.authentication.AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthRefreshTokenRepository refreshTokenRepository;
    
    public AuthService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder,
                      org.springframework.security.authentication.AuthenticationManager authenticationManager,
                      JwtTokenProvider jwtTokenProvider,
                      AuthRefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenRepository = refreshTokenRepository;
        log.info("✅ AuthService initialized with AuthenticationManager: {}", authenticationManager != null);
    }

    @Transactional
    public User signup(SignupRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists.");
        }

        User newUser = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .name(request.getName())
                .role(Role.USER)
                .build();

        return userRepository.save(newUser);
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
                                AuthRefreshToken newRefreshToken = AuthRefreshToken.builder()
                                        .token(refreshToken)
                                        .userId(userId)
                                        .expirationDate(Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiration()))
                                        .build();
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