package com.petmily.backend.api.mall.controller;

import com.petmily.backend.api.mall.dto.product.response.ProductRecommendationResponse;
import com.petmily.backend.api.mall.service.ProductRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
}

