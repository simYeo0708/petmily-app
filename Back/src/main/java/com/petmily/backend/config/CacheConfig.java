package com.petmily.backend.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(
                "walkers",           // 워커 프로필 캐시
                "pets",             // 펫 정보 캐시  
                "dashboard",        // 대시보드 데이터 캐시
                "nearbyWalkers",    // 주변 워커 캐시
                "userProfile"       // 사용자 프로필 캐시
        );
        return cacheManager;
    }
}