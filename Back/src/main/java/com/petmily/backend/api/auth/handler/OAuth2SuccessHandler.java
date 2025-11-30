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
        
        // 요청 헤더에서 정보 가져오기
        String referer = request.getHeader("Referer");
        String userAgent = request.getHeader("User-Agent");
        String origin = request.getHeader("Origin");
        
        log.info("OAuth2 Success - Referer: {}, User-Agent: {}, Origin: {}", referer, userAgent, origin);
        
        String redirectBaseUrl;
        
        // 모바일 앱 감지: User-Agent에 모바일 관련 키워드가 있거나, Origin이 없고 Referer가 특정 패턴인 경우
        boolean isMobile = false;
        if (userAgent != null) {
            String lowerUserAgent = userAgent.toLowerCase();
            isMobile = lowerUserAgent.contains("mobile") || 
                      lowerUserAgent.contains("android") || 
                      lowerUserAgent.contains("iphone") ||
                      lowerUserAgent.contains("ipad") ||
                      lowerUserAgent.contains("expo") ||
                      lowerUserAgent.contains("simulator"); // 시뮬레이터 감지 추가
        }
        
        // Origin이 없거나 특정 패턴인 경우도 모바일로 간주
        if (!isMobile && (origin == null || origin.isEmpty())) {
            isMobile = true;
        }
        
        // Referer에 특정 패턴이 있으면 모바일로 간주 (시뮬레이터 대응)
        if (!isMobile && referer != null) {
            String lowerReferer = referer.toLowerCase();
            if (lowerReferer.contains("localhost") || lowerReferer.contains("127.0.0.1")) {
                // 로컬호스트에서 온 요청은 모바일로 간주 (시뮬레이터 환경)
                isMobile = true;
            }
        }
        
        if (isMobile) {
            // 모바일 앱인 경우 - Deep Link 사용
            redirectBaseUrl = "petmily://oauth2/redirect";
            log.info("Redirecting to mobile app: {}", redirectBaseUrl);
        } else {
            // 웹인 경우 - 환경 변수나 설정에서 가져오거나 기본값 사용
            String webRedirectUrl = System.getenv("WEB_OAUTH_REDIRECT_URL");
            if (webRedirectUrl == null || webRedirectUrl.isEmpty()) {
                webRedirectUrl = "http://localhost:3000/oauth2/redirect";
            }
            redirectBaseUrl = webRedirectUrl;
            log.info("Redirecting to web: {}", redirectBaseUrl);
        }
        
        String targetUrl = UriComponentsBuilder.fromUriString(redirectBaseUrl)
                .queryParam("accessToken", accessToken)
                .build().toUriString();
        
        log.info("Final redirect URL: {}", targetUrl);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}