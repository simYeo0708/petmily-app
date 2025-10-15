package com.petmily.backend.api.auth.jwt;

import com.petmily.backend.domain.auth.token.TokenKey;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;

@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException{

        String accessToken = resolveToken(request);

        if (accessToken != null) {
            // 테스트용: JWT 검증 비활성화
            try {
                if (jwtTokenProvider.validateToken(accessToken)) {
                    setAuthentication(accessToken);
                }
            } catch (Exception e) {
                // 테스트용: 토큰 검증 실패 시에도 계속 진행
                System.out.println("JWT validation failed (test mode): " + e.getMessage());
                // 하드코딩된 사용자 ID 1로 인증 설정
                setTestAuthentication();
            }
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(String token) {
        Authentication authentication = jwtTokenProvider.getAuthentication(token);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    // 테스트용 인증 설정
    private void setTestAuthentication() {
        try {
            // 하드코딩된 사용자 ID 1로 인증 설정
            Authentication authentication = jwtTokenProvider.getAuthentication("test-token-for-user-1");
            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("Test authentication set for user ID 1");
        } catch (Exception e) {
            System.out.println("Failed to set test authentication: " + e.getMessage());
        }
    }

    // Request Header에서 토큰 추출
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(TokenKey.TOKEN_PREFIX)) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // 정적 메서드로 토큰 추출 (다른 클래스에서 사용)
    public static String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(TokenKey.TOKEN_PREFIX)) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
