package com.petmily.backend.api.mall.controller;

import com.petmily.backend.api.mall.dto.product.response.ProductRecommendationResponse;
import com.petmily.backend.api.mall.service.ProductRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/products/recommendations")
@RequiredArgsConstructor
public class ProductRecommendationController {

    private final ProductRecommendationService recommendationService;

    @GetMapping("/pet/{petId}")
    public ResponseEntity<List<ProductRecommendationResponse>> getRecommendations(
            @PathVariable Long petId,
            @AuthenticationPrincipal UserDetails userDetails) {
        // userId는 향후 권한 체크에 사용할 수 있음
        
        List<ProductRecommendationService.ProductRecommendation> recommendations = 
                recommendationService.recommendProducts(petId);
        
        List<ProductRecommendationResponse> response = recommendations.stream()
                .map(ProductRecommendationResponse::from)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 조회 이력 개수 확인
     */
    @GetMapping("/user/view-history-count")
    public ResponseEntity<Map<String, Object>> getViewHistoryCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = com.petmily.backend.api.common.util.SecurityUtils.getUserId(userDetails);
        
        int count = recommendationService.getViewHistoryCount(userId);
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("count", count);
        response.put("hasEnoughHistory", count >= 3); // 최소 3개 이상 필요
        
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 행동 기반 상품 추천 (구매 이력, 좋아요, 장바구니 활용)
     */
    @GetMapping("/user")
    public ResponseEntity<List<ProductRecommendationResponse>> getRecommendationsByUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = com.petmily.backend.api.common.util.SecurityUtils.getUserId(userDetails);
        
        List<ProductRecommendationService.ProductRecommendation> recommendations = 
                recommendationService.recommendProductsByUser(userId);
        
        List<ProductRecommendationResponse> response = recommendations.stream()
                .map(ProductRecommendationResponse::from)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
}

