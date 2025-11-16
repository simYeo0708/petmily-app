package com.petmily.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class RateLimitInterceptor implements HandlerInterceptor {

    private final int maxRequestsPerMinute;
    private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lastResetTime = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupScheduler = Executors.newSingleThreadScheduledExecutor();

    public RateLimitInterceptor(int maxRequestsPerMinute) {
        this.maxRequestsPerMinute = maxRequestsPerMinute;

        // 5분마다 오래된 엔트리 정리 (메모리 누수 방지)
        cleanupScheduler.scheduleAtFixedRate(this::cleanupOldEntries, 5, 5, TimeUnit.MINUTES);
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
    
    /**
     * 10분 이상 요청이 없는 클라이언트 정보 정리
     */
    private void cleanupOldEntries() {
        long currentTime = System.currentTimeMillis();
        long expirationTime = 10 * 60 * 1000; // 10분

        Iterator<Map.Entry<String, Long>> iterator = lastResetTime.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Long> entry = iterator.next();
            if (currentTime - entry.getValue() > expirationTime) {
                String clientId = entry.getKey();
                iterator.remove();
                requestCounts.remove(clientId);
            }
        }
    }

    private String getClientIdentifier(HttpServletRequest request) {
        // JWT 토큰에서 사용자 ID 추출 시도
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String userId = extractUserIdFromToken(token);
                if (userId != null) {
                    return "user_" + userId;
                }
            } catch (Exception e) {
                // JWT 파싱 실패 시 IP 기반으로 fallback
            }
        }

        // JWT 없으면 IP + UserAgent 조합 사용
        String userAgent = request.getHeader("User-Agent");
        String clientIp = getClientIpAddress(request);
        return "ip_" + clientIp + "_" + (userAgent != null ? userAgent.hashCode() : "anonymous");
    }

    private String extractUserIdFromToken(String token) {
        try {
            // JWT 파싱 (간단한 구현, 실제로는 JwtUtil 사용 권장)
            String[] parts = token.split("\\.");
            if (parts.length >= 2) {
                String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                // payload에서 userId 추출 (실제로는 JSON 파싱 필요)
                // 여기서는 간단히 처리
                if (payload.contains("\"sub\"")) {
                    int start = payload.indexOf("\"sub\":") + 7;
                    int end = payload.indexOf(",", start);
                    if (end == -1) end = payload.indexOf("}", start);
                    if (start > 6 && end > start) {
                        return payload.substring(start, end).replaceAll("\"", "").trim();
                    }
                }
            }
        } catch (Exception e) {
            // 파싱 실패 시 null 반환
        }
        return null;
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