package com.petmily.backend.config;

import com.petmily.backend.api.auth.exception.TokenExceptionFilter;
import com.petmily.backend.api.auth.handler.CustomAccessDeniedHandler;
import com.petmily.backend.api.auth.handler.CustomAuthenticationEntryPoint;
import com.petmily.backend.api.auth.handler.OAuth2SuccessHandler;
import com.petmily.backend.api.auth.jwt.JwtAuthenticationFilter;
import com.petmily.backend.api.auth.oauth.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomOAuth2UserService oAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${oauth2.client.google.client-id:}")
    private String googleClientId;
    
    @Value("${oauth2.client.google.client-secret:}")
    private String googleClientSecret;
    
    @Value("${oauth2.client.kakao.client-id:}")
    private String kakaoClientId;
    
    @Value("${oauth2.client.kakao.client-secret:}")
    private String kakaoClientSecret;
    
    @Value("${oauth2.client.naver.client-id:}")
    private String naverClientId;
    
    @Value("${oauth2.client.naver.client-secret:}")
    private String naverClientSecret;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring()
                .requestMatchers("/error", "/favicon.ico");
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(formLogin -> formLogin.disable())
                .logout(logout -> logout.disable())
                .headers(c -> c.frameOptions(
                        HeadersConfigurer.FrameOptionsConfig::disable).disable())
                .sessionManagement(c -> c.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(request ->
                        request.requestMatchers(
                                new AntPathRequestMatcher("/"),
                                new AntPathRequestMatcher("/auth/**"),
                                new AntPathRequestMatcher("/users/**"),
                                new AntPathRequestMatcher("/pets/**"),  // 디버그용: 모든 펫 API 허용
                                new AntPathRequestMatcher("/map/**"),
                                new AntPathRequestMatcher("/notifications/**"),
                                new AntPathRequestMatcher("/search/**"),
                                new AntPathRequestMatcher("/auth/test/**"),
                                new AntPathRequestMatcher("/api/products/**", "GET"),
                                new AntPathRequestMatcher("/api/reviews/products/**", "GET"),
                                new AntPathRequestMatcher("/api/reviews/**", "GET")
                        ).permitAll().anyRequest().authenticated()
                )

                .oauth2Login(oauth ->
                        oauth.userInfoEndpoint(c -> c.userService(oAuth2UserService))
                             .successHandler(oAuth2SuccessHandler)
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new TokenExceptionFilter(), jwtAuthenticationFilter.getClass())

                .exceptionHandling((exceptions) -> exceptions
                        .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                        .accessDeniedHandler(new CustomAccessDeniedHandler()));

        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        List<ClientRegistration> registrations = Stream.of(
                googleClientRegistration(),
                kakaoClientRegistration(),
                naverClientRegistration()
        ).collect(Collectors.toList());
        return new InMemoryClientRegistrationRepository(registrations);
    }

    private ClientRegistration googleClientRegistration() {
        String clientId = googleClientId.isEmpty() ? System.getenv("GOOGLE_CLIENT_ID") : googleClientId;
        String clientSecret = googleClientSecret.isEmpty() ? System.getenv("GOOGLE_CLIENT_SECRET") : googleClientSecret;
        
        if (clientId == null || clientId.trim().isEmpty()) {
            clientId = "dummy-google-client-id";
        }
        if (clientSecret == null || clientSecret.trim().isEmpty()) {
            clientSecret = "dummy-google-client-secret";
        }
        
        return ClientRegistration.withRegistrationId("google")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .redirectUri("http://localhost:8083/login/oauth2/code/google")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .scope("email", "profile")
                .authorizationUri("https://accounts.google.com/o/oauth2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName(IdTokenClaimNames.SUB)
                .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
                .clientName("Google")
                .build();
    }

    private ClientRegistration kakaoClientRegistration() {
        String clientId = kakaoClientId.isEmpty() ? System.getenv("KAKAO_CLIENT_ID") : kakaoClientId;
        String clientSecret = kakaoClientSecret.isEmpty() ? System.getenv("KAKAO_CLIENT_SECRET") : kakaoClientSecret;
        
        if (clientId == null || clientId.trim().isEmpty()) {
            clientId = "dummy-kakao-client-id";
        }
        if (clientSecret == null || clientSecret.trim().isEmpty()) {
            clientSecret = "dummy-kakao-client-secret";
        }
        
        return ClientRegistration.withRegistrationId("kakao")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .redirectUri("http://localhost:8083/login/oauth2/code/kakao")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .scope("account_email", "profile_nickname", "profile_image")
                .authorizationUri("https://kauth.kakao.com/oauth/authorize")
                .tokenUri("https://kauth.kakao.com/oauth/token")
                .userInfoUri("https://kapi.kakao.com/v2/user/me")
                .clientName("Kakao")
                .build();
    }

    private ClientRegistration naverClientRegistration() {
        String clientId = naverClientId.isEmpty() ? System.getenv("NAVER_CLIENT_ID") : naverClientId;
        String clientSecret = naverClientSecret.isEmpty() ? System.getenv("NAVER_CLIENT_SECRET") : naverClientSecret;
        
        if (clientId == null || clientId.trim().isEmpty()) {
            clientId = "dummy-naver-client-id";
        }
        if (clientSecret == null || clientSecret.trim().isEmpty()) {
            clientSecret = "dummy-naver-client-secret";
        }
        
        return ClientRegistration.withRegistrationId("naver")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .redirectUri("http://localhost:8083/login/oauth2/code/naver")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .scope("name", "email", "profile_image")
                .authorizationUri("https://nid.naver.com/oauth2.0/authorize")
                .tokenUri("https://nid.naver.com/oauth2.0/token")
                .userInfoUri("https://openapi.naver.com/v1/nid/me")
                .clientName("Naver")
                .build();
    }
}

