package com.petmily.backend.api.auth.handler;

import com.petmily.backend.api.auth.cookie.CookieUtils;
import com.petmily.backend.api.auth.jwt.JwtTokenProvider;
import com.petmily.backend.api.auth.oauth.CustomOAuth2User;

import com.petmily.backend.domain.auth.entity.AuthRefreshToken;
import com.petmily.backend.domain.auth.repository.AuthRefreshTokenRepository;
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

        // RefreshToken은 HttpOnly 쿠키로 설정
        CookieUtils.setRefreshTokenCookie(response, refreshToken);

        // AccessToken만 URL 파라미터로 전달 (프론트에서 받아서 저장)
        // 웹과 모바일 모두 지원: 웹은 http://localhost:3000/oauth2/redirect, 모바일은 petmily://oauth2/redirect
        String referer = request.getHeader("Referer");
        String userAgent = request.getHeader("User-Agent");
        
        String redirectBaseUrl;
        if (userAgent != null && (userAgent.contains("Mobile") || userAgent.contains("Android") || userAgent.contains("iPhone"))) {
            // 모바일 앱인 경우
            redirectBaseUrl = "petmily://oauth2/redirect";
        } else {
            // 웹인 경우 - 환경 변수나 설정에서 가져오거나 기본값 사용
            String webRedirectUrl = System.getenv("WEB_OAUTH_REDIRECT_URL");
            if (webRedirectUrl == null || webRedirectUrl.isEmpty()) {
                webRedirectUrl = "http://localhost:3000/oauth2/redirect";
            }
            redirectBaseUrl = webRedirectUrl;
        }
        
        String targetUrl = UriComponentsBuilder.fromUriString(redirectBaseUrl)
                .queryParam("accessToken", accessToken)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}