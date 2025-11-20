package com.petmily.backend.api.auth.service;

import com.petmily.backend.api.auth.dto.request.LoginRequest;
import com.petmily.backend.api.auth.dto.request.SignupRequest;
import com.petmily.backend.api.auth.dto.response.TokenResponse;
import com.petmily.backend.api.auth.jwt.JwtTokenProvider;
import com.petmily.backend.domain.auth.entity.AuthRefreshToken;
import com.petmily.backend.domain.auth.repository.AuthRefreshTokenRepository;
import com.petmily.backend.domain.user.entity.Role;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@Disabled("Mall 구조 통합 이후 인증 흐름 재검토 필요")
class AuthServiceTest {

    @Mock(lenient = true)
    private UserRepository userRepository;
    @Mock(lenient = true)
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManagerBuilder authenticationManagerBuilder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private AuthRefreshTokenRepository refreshTokenRepository;
    @Mock
    private AuthenticationManager authenticationManager; // Mock the AuthenticationManager itself

    @InjectMocks
    private AuthService authService;


    @Test
    @DisplayName("회원가입 성공")
    void signup_success() {
        // Given
        SignupRequest request = new SignupRequest();
        request.setUsername("testuser");
        request.setPassword("password");
        request.setEmail("test@example.com");
        request.setName("Test User");

        User newUser = User.builder()
                .username("testuser")
                .password("encodedPassword")
                .email("test@example.com")
                .name("Test User")
                .role(Role.USER)
                .build();

        when(userRepository.findByUsername(request.getUsername())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(newUser);
        

        // When
        authService.signup(request);

        // Then
        verify(userRepository, times(1)).findByUsername(request.getUsername());
        verify(userRepository, times(1)).findByEmail(request.getEmail());
        verify(passwordEncoder, times(1)).encode(request.getPassword());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("회원가입 실패 - 사용자 이름 중복")
    void signup_fail_username_exists() {
        // Given
        SignupRequest request = new SignupRequest();
        request.setUsername("existinguser");
        request.setPassword("password");
        request.setEmail("test@example.com");
        request.setName("Test User");

        when(userRepository.findByUsername(request.getUsername())).thenReturn(Optional.of(User.builder().build()));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> authService.signup(request));
        assertEquals("Username already exists.", exception.getMessage());
        verify(userRepository, times(1)).findByUsername(request.getUsername());
        verify(userRepository, never()).findByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 중복")
    void signup_fail_email_exists() {
        // Given
        SignupRequest request = new SignupRequest();
        request.setUsername("testuser");
        request.setPassword("password");
        request.setEmail("existing@example.com");
        request.setName("Test User");

        when(userRepository.findByUsername(request.getUsername())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(User.builder().build()));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> authService.signup(request));
        assertEquals("Email already exists.", exception.getMessage());
        verify(userRepository, times(1)).findByUsername(request.getUsername());
        verify(userRepository, times(1)).findByEmail(request.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("로그인 성공 - 기존 Refresh Token 없음")
    void login_success_no_existing_refreshToken() {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        User user = User.builder().id(1L).username("testuser").build();
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("testuser");

        when(authenticationManagerBuilder.getObject()).thenReturn(authenticationManager);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(jwtTokenProvider.generateAccessToken(authentication)).thenReturn("newAccessToken");
        when(jwtTokenProvider.generateRefreshToken(authentication)).thenReturn("newRefreshToken");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(refreshTokenRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(jwtTokenProvider.getRefreshTokenExpiration()).thenReturn(604800000L); // 7 days in millis

        // When
        TokenResponse tokenResponse = authService.login(request);

        // Then
        assertNotNull(tokenResponse);
        assertEquals("newAccessToken", tokenResponse.getAccessToken());
        assertEquals("newRefreshToken", tokenResponse.getRefreshToken());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider, times(1)).generateAccessToken(authentication);
        verify(jwtTokenProvider, times(1)).generateRefreshToken(authentication);
        verify(userRepository, times(1)).findByUsername("testuser");
        verify(refreshTokenRepository, times(1)).findByUserId(1L);
        verify(refreshTokenRepository, times(1)).save(any(AuthRefreshToken.class));
    }

    @Test
    @DisplayName("로그인 성공 - 기존 Refresh Token 업데이트")
    void login_success_update_existing_refreshToken() {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        User user = User.builder().id(1L).username("testuser").build();
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("testuser");

        AuthRefreshToken existingRefreshToken = AuthRefreshToken.builder()
                .id(1L)
                .userId(1L)
                .token("oldRefreshToken")
                .expirationDate(Instant.now().minusSeconds(100)) // Expired
                .build();

        when(authenticationManagerBuilder.getObject()).thenReturn(authenticationManager);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(jwtTokenProvider.generateAccessToken(authentication)).thenReturn("newAccessToken");
        when(jwtTokenProvider.generateRefreshToken(authentication)).thenReturn("newRefreshToken");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(refreshTokenRepository.findByUserId(1L)).thenReturn(Optional.of(existingRefreshToken));
        when(jwtTokenProvider.getRefreshTokenExpiration()).thenReturn(604800000L); // 7 days in millis

        // When
        TokenResponse tokenResponse = authService.login(request);

        // Then
        assertNotNull(tokenResponse);
        assertEquals("newAccessToken", tokenResponse.getAccessToken());
        assertEquals("newRefreshToken", tokenResponse.getRefreshToken());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider, times(1)).generateAccessToken(authentication);
        verify(jwtTokenProvider, times(1)).generateRefreshToken(authentication);
        verify(userRepository, times(1)).findByUsername("testuser");
        verify(refreshTokenRepository, times(1)).findByUserId(1L);
        verify(refreshTokenRepository, times(1)).save(existingRefreshToken); // Verify update and save
        assertEquals("newRefreshToken", existingRefreshToken.getToken()); // Check if token was updated
    }

    @Test
    @DisplayName("로그인 실패 - 사용자 없음")
    void login_fail_user_not_found() {
        // Given
        LoginRequest request = new LoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("password");

        when(authenticationManagerBuilder.getObject()).thenReturn(authenticationManager);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new UsernameNotFoundException("User not found"));

        // When & Then
        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class, () -> authService.login(request));
        assertEquals("User not found", exception.getMessage());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, never()).findByUsername(anyString()); // Should not reach here
        verify(jwtTokenProvider, never()).generateAccessToken(any());
    }
}
