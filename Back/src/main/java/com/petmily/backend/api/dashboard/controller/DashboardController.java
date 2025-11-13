package com.petmily.backend.api.dashboard.controller;

import com.petmily.backend.api.common.dto.ApiResponse;
import com.petmily.backend.api.dashboard.dto.DashboardResponse;
import com.petmily.backend.api.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(Authentication authentication) {
        String username = authentication.getName();
        DashboardResponse dashboard = dashboardService.getDashboard(username);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}