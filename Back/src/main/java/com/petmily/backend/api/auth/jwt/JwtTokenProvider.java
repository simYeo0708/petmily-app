package com.petmily.backend.api.auth.jwt;

import com.petmily.backend.api.auth.exception.TokenException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.auth.token.AuthRefreshTokenRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.key}")
    private String key;

    private SecretKey secretKey;

    @Value("${jwt.access.expiration}")
    private long accessTokenExpiration; // 30분

    @Value("${jwt.refresh.expiration}")
    private long refreshTokenExpiration; // 7일

    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }

    private static final String KEY_ROLE = "role";

    private final AuthRefreshTokenRepository refreshTokenRepository;

    @PostConstruct
    private void setSecretKey() {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(key));
    }

    public String generateAccessToken(Authentication authentication) {
        return generateToken(authentication, accessTokenExpiration);
    }

    public String generateRefreshToken(Authentication authentication) {
        return generateToken(authentication, refreshTokenExpiration);
    }

    public String generateToken(Authentication authentication, long expiration) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + expiration);

        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining());
        
        // username을 subject로, userId를 별도 claim으로 저장
        String username = authentication.getName();

        return Jwts.builder()
                .setHeader(createHeaders())
                .setSubject(username)  // username을 subject로
                .claim("role", authorities)
                .claim("username", username)  // username을 claim으로도 저장
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // JWT 토큰을 복호화하여 토큰에 들어있는 정보를 꺼내 Authentication 객체를 생성하는 메소드
    public Authentication getAuthentication(String token) {
        // 테스트용 토큰 처리
        if ("test-token-for-user-1".equals(token)) {
            return getTestAuthentication();
        }
        
        // Jwt 토큰 복호화
        Claims claims = parseClaims(token);

        // 클레임에서 권한 가져오기
        List<SimpleGrantedAuthority> authorities = getAuthorities(claims);

        // UserDetails 객체를 만들어서 Authentication 리턴
        User principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    // 테스트용 인증 객체 생성
    private Authentication getTestAuthentication() {
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_USER")
        );
        User principal = new User("1", "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, "test-token", authorities);
    }

    private List<SimpleGrantedAuthority> getAuthorities(Claims claims) {
        return Collections.singletonList(new SimpleGrantedAuthority(
                claims.get(KEY_ROLE).toString()
        ));
    }

    public String reissueAccessToken(String refreshToken) {
        // refresh token 유효성 검사
        if(!StringUtils.hasText(refreshToken)) {
            throw new TokenException(ErrorCode.INVALID_TOKEN);
        } else if(!validateToken(refreshToken)) {
            throw new TokenException(ErrorCode.TOKEN_EXPIRED);
        } else {
            // DB에 refresh token 존재 여부 확인
            refreshTokenRepository.findByToken(refreshToken)
                    .orElseThrow(() -> new TokenException(ErrorCode.TOKEN_EXPIRED));

            // refresh token에서 authentication 정보 가져오기
            Authentication authentication = getAuthentication(refreshToken);

            // 새로운 access token 생성
            return generateAccessToken(authentication);
        }

    }

    public boolean validateToken(String token) {
        if(!StringUtils.hasText(token)) {
            return false;
        }

        Claims claims = parseClaims(token);
        return claims.getExpiration().after(new Date());

    }

    // JWT 토큰을 파싱하여 클레임 정보를 반환하는 메소드
    private Claims parseClaims(String token) {
        try{
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        } catch (MalformedJwtException e){
            throw new TokenException(ErrorCode.INVALID_TOKEN);
        } catch (SecurityException e){
            throw new TokenException(ErrorCode.INVALID_JWT_SIGNATURE);
        }
    }

    private static Map<String, Object> createHeaders() {
        Map<String, Object> headers = new HashMap<>();
        headers.put("alg", "HS256");
        headers.put("typ", "JWT");
        return headers;
    }

    // JWT 토큰에서 사용자 ID를 추출하는 메서드
    // 주의: 이 메서드는 더 이상 사용하지 않습니다. getUsernameFromToken()을 사용하세요.
    @Deprecated
    public Long getUserIdFromToken(String token) {
        try {
            // "Bearer " 접두사 제거
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            Claims claims = parseClaims(token);
            // subject가 username이므로, userId claim이 있으면 그것을 사용
            Object userIdObj = claims.get("userId");
            if (userIdObj != null) {
                return Long.parseLong(userIdObj.toString());
            }
            // userId가 없으면 subject를 Long으로 파싱 시도 (하위 호환성)
            try {
                return Long.parseLong(claims.getSubject());
            } catch (NumberFormatException e) {
                // subject가 username인 경우, username으로 userId를 조회해야 함
                log.warn("JWT subject is username, not userId. Please use getUsernameFromToken() instead.");
                throw new TokenException(ErrorCode.INVALID_TOKEN);
            }
        } catch (TokenException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error extracting userId from token", e);
            throw new TokenException(ErrorCode.INVALID_TOKEN);
        }
    }
    
    // JWT 토큰에서 username을 추출하는 메서드
    public String getUsernameFromToken(String token) {
        try {
            // "Bearer " 접두사 제거
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            Claims claims = parseClaims(token);
            return claims.getSubject();  // subject는 username
        } catch (Exception e) {
            log.error("Error extracting username from token", e);
            throw new TokenException(ErrorCode.INVALID_TOKEN);
        }
    }

}
