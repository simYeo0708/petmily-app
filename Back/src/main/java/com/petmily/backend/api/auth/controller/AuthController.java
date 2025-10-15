package com.petmily.backend.api.auth.controller;

import com.petmily.backend.api.auth.cookie.CookieUtils;
import com.petmily.backend.api.auth.dto.request.LoginRequest;
import com.petmily.backend.api.auth.dto.request.SignupRequest;
import com.petmily.backend.api.auth.dto.request.RefreshTokenRequest;
import com.petmily.backend.api.auth.dto.response.TokenResponse;
import com.petmily.backend.api.auth.service.AuthService;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<TokenResponse> signup(@RequestBody SignupRequest request) {
        User newUser = authService.signup(request);
        // 회원가입 후 자동 로그인 처리
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(request.getUsername());
        loginRequest.setPassword(request.getPassword());
        TokenResponse token = authService.login(loginRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(token);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        TokenResponse token = authService.login(request);
        CookieUtils.setCookie(response, token);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/reissue")
    public ResponseEntity<TokenResponse> reissue(@RequestHeader("Refresh-Token") String refreshToken, HttpServletResponse response) {
        TokenResponse token = authService.reissue(refreshToken);
        CookieUtils.setCookie(response, token);
        return ResponseEntity.ok(token);
    }
    
    // 프론트엔드 호환성을 위한 /refresh 엔드포인트 추가
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody RefreshTokenRequest request, HttpServletResponse response) {
        TokenResponse token = authService.reissue(request.getRefreshToken());
        CookieUtils.setCookie(response, token);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = CookieUtils.getCookie(request, "refreshToken");
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        CookieUtils.deleteCookie(response);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/withdraw")
    public ResponseEntity<Void> withdraw(HttpServletResponse response) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        authService.withdraw(authentication.getName());
        CookieUtils.deleteCookie(response);
        return ResponseEntity.ok().build();
    }
    
    // 프론트엔드 호환성을 위한 /me 엔드포인트 추가
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    // 테스트용 사용자 생성 및 로그인 API
    @PostMapping("/test/setup")
    public ResponseEntity<TokenResponse> setupTestUser() {
        try {
            // 테스트용 사용자 생성
            SignupRequest signupRequest = new SignupRequest();
            signupRequest.setEmail("test@example.com");
            signupRequest.setPassword("asdf");
            signupRequest.setUsername("testuser");
            signupRequest.setName("testuser");
            
            User testUser = authService.signup(signupRequest);
            System.out.println("Test user created with ID: " + testUser.getId());
            
            // 로그인하여 토큰 발급
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername("testuser");
            loginRequest.setPassword("asdf");
            
            TokenResponse token = authService.login(loginRequest);
            System.out.println("Test user logged in successfully");
            
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            System.err.println("Error setting up test user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 디버그용 사용자 목록 조회 API
    @GetMapping("/test/users")
    public ResponseEntity<?> getAllUsersDebug() {
        try {
            log.info("Fetching all users for debug");
            var users = authService.getAllUsersForDebug();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users for debug", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // 디버그용 비밀번호 해시 생성 API
    @GetMapping("/test/generate-hash")
    public ResponseEntity<?> generatePasswordHash(@RequestParam(defaultValue = "asdf") String password) {
        try {
            org.springframework.security.crypto.password.PasswordEncoder encoder = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
            
            String hash = encoder.encode(password);
            boolean matches = encoder.matches(password, hash);
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("password", password);
            response.put("hash", hash);
            response.put("verified", matches);
            response.put("sql", "INSERT INTO users (username, email, password, name, role) VALUES ('asdf', 'asdf@test.com', '" + hash + "', 'asdf', 'USER');");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating password hash", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}