package com.petmily.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public class RateLimitInterceptor implements HandlerInterceptor {
    
    private final int maxRequestsPerMinute;
    private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lastResetTime = new ConcurrentHashMap<>();
    
    public RateLimitInterceptor(int maxRequestsPerMinute) {
        this.maxRequestsPerMinute = maxRequestsPerMinute;
    }
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientId = getClientIdentifier(request);
        
        long currentTime = System.currentTimeMillis();
        long windowStart = lastResetTime.getOrDefault(clientId, currentTime);
        
        // 1분 윈도우 체크
        if (currentTime - windowStart > 60000) {
            requestCounts.put(clientId, new AtomicInteger(0));
            lastResetTime.put(clientId, currentTime);
        }
        
        AtomicInteger count = requestCounts.computeIfAbsent(clientId, k -> new AtomicInteger(0));
        
        if (count.incrementAndGet() > maxRequestsPerMinute) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.\"}");
            return false;
        }
        
        return true;
    }
    
    private String getClientIdentifier(HttpServletRequest request) {
        // 실제로는 JWT 토큰에서 사용자 ID를 추출하거나 IP 주소를 사용
        String userAgent = request.getHeader("User-Agent");
        String clientIp = getClientIpAddress(request);
        return clientIp + "_" + (userAgent != null ? userAgent.hashCode() : "anonymous");
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}