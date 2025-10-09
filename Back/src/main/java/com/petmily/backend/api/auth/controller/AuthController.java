package com.petmily.backend.api.auth.controller;

import com.petmily.backend.api.auth.cookie.CookieUtils;
import com.petmily.backend.api.auth.dto.request.LoginRequest;
import com.petmily.backend.api.auth.dto.request.SignupRequest;
import com.petmily.backend.api.auth.dto.response.TokenResponse;
import com.petmily.backend.api.auth.service.AuthService;
import com.petmily.backend.domain.user.entity.User;
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

    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody SignupRequest request) {
        User newUser = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        TokenResponse token = authService.login(request);

        CookieUtils.setRefreshTokenCookie(response, token.getRefreshToken());

        return ResponseEntity.ok(TokenResponse.builder()
                .accessToken(token.getAccessToken())
                .build());
    }

    @PostMapping("/reissue")
    public ResponseEntity<TokenResponse> reissue(@CookieValue("refreshToken") String refreshToken, HttpServletResponse response) {
        TokenResponse token = authService.reissue(refreshToken);

        CookieUtils.setRefreshTokenCookie(response, token.getRefreshToken());

        return ResponseEntity.ok(TokenResponse.builder()
                .accessToken(token.getAccessToken())
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue("refreshToken") String refreshToken, HttpServletResponse response) {
        authService.logout(refreshToken);

        CookieUtils.deleteRefreshTokenCookie(response);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/withdraw")
    public ResponseEntity<Void> withdraw(HttpServletResponse response) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        authService.withdraw(authentication.getName());

        CookieUtils.deleteRefreshTokenCookie(response);

        return ResponseEntity.ok().build();
    }
}