package com.petmily.backend.api.dashboard.controller;

import com.petmily.backend.api.common.dto.ApiResponse;
import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.dashboard.dto.DashboardResponse;
import com.petmily.backend.api.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * 사용자 대시보드 전체 데이터 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        String userAgent = request.getHeader("User-Agent");
        String clientIp = getClientIp(request);

        log.info("Dashboard access - User: {}, IP: {}, UserAgent: {}", userId, clientIp, userAgent);

        try {
            DashboardResponse dashboard = dashboardService.getDashboard(userId);
            log.debug("Dashboard data retrieved successfully for user: {}", userId);
            return ResponseEntity.ok(ApiResponse.success(dashboard, "대시보드 데이터를 성공적으로 조회했습니다."));
        } catch (Exception e) {
            log.error("Failed to retrieve dashboard for user: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("대시보드 데이터 조회에 실패했습니다."));
        }
    }

    /**
     * 대시보드 요약 통계만 조회 (빠른 응답용)
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardResponse.OverallStats>> getDashboardSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);

        try {
            DashboardResponse.OverallStats summary = dashboardService.getDashboardSummary(userId);
            return ResponseEntity.ok(ApiResponse.success(summary, "대시보드 요약 통계를 조회했습니다."));
        } catch (Exception e) {
            log.error("Failed to retrieve dashboard summary for user: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("대시보드 요약 통계 조회에 실패했습니다."));
        }
    }

    /**
     * 사용자 정보만 조회
     */
    @GetMapping("/user-info")
    public ResponseEntity<ApiResponse<DashboardResponse.UserInfo>> getUserInfo(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);

        try {
            DashboardResponse.UserInfo userInfo = dashboardService.getUserInfo(userId);
            return ResponseEntity.ok(ApiResponse.success(userInfo, "사용자 정보를 조회했습니다."));
        } catch (Exception e) {
            log.error("Failed to retrieve user info for user: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("사용자 정보 조회에 실패했습니다."));
        }
    }

    /**
     * 반려동물 통계만 조회
     */
    @GetMapping("/pets")
    public ResponseEntity<ApiResponse<DashboardResponse.PetStats>> getPetStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);

        try {
            DashboardResponse.PetStats petStats = dashboardService.getPetStats(userId);
            return ResponseEntity.ok(ApiResponse.success(petStats, "반려동물 통계를 조회했습니다."));
        } catch (Exception e) {
            log.error("Failed to retrieve pet stats for user: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("반려동물 통계 조회에 실패했습니다."));
        }
    }

    /**
     * 산책 통계만 조회
     */
    @GetMapping("/walking")
    public ResponseEntity<ApiResponse<DashboardResponse.WalkingStats>> getWalkingStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);

        try {
            DashboardResponse.WalkingStats walkingStats = dashboardService.getWalkingStats(userId);
            return ResponseEntity.ok(ApiResponse.success(walkingStats, "산책 통계를 조회했습니다."));
        } catch (Exception e) {
            log.error("Failed to retrieve walking stats for user: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("산책 통계 조회에 실패했습니다."));
        }
    }

    /**
     * 쇼핑 관련 통계만 조회
     */
    @GetMapping("/shopping")
    public ResponseEntity<ApiResponse<DashboardResponse.ShoppingOverview>> getShoppingOverview(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);

        try {
            DashboardResponse.ShoppingOverview shoppingOverview = dashboardService.getShoppingOverview(userId);
            return ResponseEntity.ok(ApiResponse.success(shoppingOverview, "쇼핑 통계를 조회했습니다."));
        } catch (Exception e) {
            log.error("Failed to retrieve shopping overview for user: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("쇼핑 통계 조회에 실패했습니다."));
        }
    }

    /**
     * 채팅 관련 통계만 조회
     */
    @GetMapping("/chat")
    public ResponseEntity<ApiResponse<DashboardResponse.ChatOverview>> getChatOverview(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);

        try {
            DashboardResponse.ChatOverview chatOverview = dashboardService.getChatOverview(userId);
            return ResponseEntity.ok(ApiResponse.success(chatOverview, "채팅 통계를 조회했습니다."));
        } catch (Exception e) {
            log.error("Failed to retrieve chat overview for user: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("채팅 통계 조회에 실패했습니다."));
        }
    }

    /**
     * 대시보드 새로고침 (캐시 무효화)
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<DashboardResponse>> refreshDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);

        try {
            DashboardResponse dashboard = dashboardService.refreshDashboard(userId);
            log.info("Dashboard refreshed for user: {}", userId);
            return ResponseEntity.ok(ApiResponse.success(dashboard, "대시보드를 새로고침했습니다."));
        } catch (Exception e) {
            log.error("Failed to refresh dashboard for user: {}", userId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("대시보드 새로고침에 실패했습니다."));
        }
    }

    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIp(HttpServletRequest request) {
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