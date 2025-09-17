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
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthRefreshTokenRepository refreshTokenRepository;

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
                .role(Role.USER) // Default role
                .build();

        return userRepository.save(newUser);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        // 1. Login ID/PW 기반 AuthenticationToken 생성
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());

        // 2. 실제로 검증 (사용자 비밀번호 체크) 이 이루어지는 부분
        //    authenticate 메서드가 실행이 될 때 CustomUserDetailsService 에서 만들었던 loadUserByUsername 메서드가 실행됨
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        // 3. 인증 정보를 기반으로 JWT 토큰 생성
        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        // 4. RefreshToken 저장
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Long userId = user.getId();
        refreshTokenRepository.findByUserId(userId)
                .ifPresentOrElse(
                        token -> {
                            token.updateToken(refreshToken, Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiration()));
                            refreshTokenRepository.save(token);
                        },
                        () -> {
                            AuthRefreshToken newRefreshToken = AuthRefreshToken.builder()
                                    .token(refreshToken)
                                    .userId(userId)
                                    .expirationDate(Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiration()))
                                    .build();
                            refreshTokenRepository.save(newRefreshToken);
                        }
                );

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Transactional
    public TokenResponse reissue(String refreshToken) {
        // 1. Refresh Token 유효성 검사
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new TokenException(ErrorCode.INVALID_TOKEN);
        }

        // 2. Refresh Token 에서 Authentication 정보 가져오기
        Authentication authentication = jwtTokenProvider.getAuthentication(refreshToken);

        // 3. DB 에서 Refresh Token 조회
        AuthRefreshToken storedRefreshToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new TokenException(ErrorCode.TOKEN_EXPIRED));

        // 4. 새로운 Access Token 생성
        String newAccessToken = jwtTokenProvider.generateAccessToken(authentication);

        // 5. 새로운 Refresh Token 생성 (Optional: if you want to rotate refresh tokens)
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        // 6. DB 에 Refresh Token 업데이트
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

        // Delete refresh token associated with the user
        refreshTokenRepository.findByUserId(user.getId())
                .ifPresent(refreshTokenRepository::delete);

        // Delete the user
        userRepository.delete(user);
    }
}