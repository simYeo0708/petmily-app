package com.petmily.backend.api.auth.handler;

import com.petmily.backend.api.auth.jwt.JwtTokenProvider;
import com.petmily.backend.api.auth.jwt.TokenKey;
import com.petmily.backend.api.auth.oauth.CustomOAuth2User;

import com.petmily.backend.domain.auth.token.AuthRefreshToken;
import com.petmily.backend.domain.auth.token.AuthRefreshTokenRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final AuthRefreshTokenRepository refreshTokenRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        // Save or update refresh token in DB
        refreshTokenRepository.findByUserId(oAuth2User.getId())
                .ifPresentOrElse(
                        token -> {
                            token.updateToken(refreshToken, Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiration()));
                            refreshTokenRepository.save(token);
                        },
                        () -> {
                            AuthRefreshToken newRefreshToken = AuthRefreshToken.builder()
                                    .token(refreshToken)
                                    .userId(oAuth2User.getId())
                                    .expirationDate(Instant.now().plusMillis(jwtTokenProvider.getRefreshTokenExpiration()))
                                    .build();
                            refreshTokenRepository.save(newRefreshToken);
                        }
                );

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth2/redirect") // Frontend redirect URL
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}