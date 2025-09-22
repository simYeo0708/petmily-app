package com.petmily.backend.api.auth.jwt;

import com.petmily.backend.api.auth.exception.TokenException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.auth.token.AuthRefreshTokenRepository;
import com.petmily.backend.domain.auth.token.AuthRefreshToken;
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
import org.springframework.security.core.token.TokenService;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.security.Key;
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

        return Jwts.builder()
                .setHeader(createHeaders())
                .setSubject(authentication.getName())
                .claim("role", authorities)
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // JWT 토큰을 복호화하여 토큰에 들어있는 정보를 꺼내 Authentication 객체를 생성하는 메소드
    public Authentication getAuthentication(String token) {
        // Jwt 토큰 복호화
        Claims claims = parseClaims(token);

        // 클레임에서 권한 가져오기
        List<SimpleGrantedAuthority> authorities = getAuthorities(claims);

        // UserDetails 객체를 만들어서 Authentication 리턴
        User principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);

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

}
