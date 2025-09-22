package com.petmily.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class RateLimitConfig implements WebMvcConfigurer {
    
    // 간단한 메모리 기반 rate limiting (실제로는 Redis 사용 권장)
    private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lastResetTime = new ConcurrentHashMap<>();
    
    // 모바일 앱 특성상 적절한 제한 설정
    private static final int MAX_REQUESTS_PER_MINUTE = 60;  // 분당 60회
    private static final int MAX_LOCATION_UPDATES_PER_MINUTE = 120; // 위치 업데이트는 더 자주
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // API별 다른 제한 적용
        registry.addInterceptor(new RateLimitInterceptor(MAX_REQUESTS_PER_MINUTE))
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/walker/*/location"); // 위치 업데이트 제외
                
        registry.addInterceptor(new RateLimitInterceptor(MAX_LOCATION_UPDATES_PER_MINUTE))
                .addPathPatterns("/api/walker/*/location");

    }
}