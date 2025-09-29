package com.petmily.backend.api.search.controller;

import com.petmily.backend.api.product.dto.ProductListResponse;
import com.petmily.backend.api.product.dto.ProductSearchRequest;
import com.petmily.backend.api.product.service.ProductSearchService;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileResponse;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerSearchRequest;
import com.petmily.backend.api.walker.service.WalkerSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final WalkerSearchService walkerSearchService;
    private final ProductSearchService productSearchService;

    /**
     * 통합 검색 (워커 + 상품)
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> searchAll(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "5") int walkerLimit,
            @RequestParam(defaultValue = "10") int productLimit,
            Authentication authentication) {

        // 워커 검색
        WalkerSearchRequest walkerRequest = new WalkerSearchRequest();
        walkerRequest.setKeyword(keyword);
        walkerRequest.setSize(walkerLimit);
        Page<WalkerProfileResponse> walkerResults = walkerSearchService.searchWalkers(walkerRequest, authentication);

        // 상품 검색
        ProductSearchRequest productRequest = new ProductSearchRequest();
        productRequest.setKeyword(keyword);
        productRequest.setSize(productLimit);
        Page<ProductListResponse> productResults = productSearchService.searchProducts(productRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("keyword", keyword);
        response.put("walkers", Map.of(
            "items", walkerResults.getContent(),
            "totalCount", walkerResults.getTotalElements(),
            "hasMore", walkerResults.hasNext()
        ));
        response.put("products", Map.of(
            "items", productResults.getContent(),
            "totalCount", productResults.getTotalElements(),
            "hasMore", productResults.hasNext()
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * 고급 워커 검색
     */
    @GetMapping("/walkers")
    public ResponseEntity<Page<WalkerProfileResponse>> searchWalkers(
            @ModelAttribute WalkerSearchRequest request,
            Authentication authentication) {

        Page<WalkerProfileResponse> results = walkerSearchService.searchWalkers(request, authentication);
        return ResponseEntity.ok(results);
    }

    /**
     * 고급 상품 검색
     */
    @GetMapping("/products")
    public ResponseEntity<Page<ProductListResponse>> searchProducts(
            @ModelAttribute ProductSearchRequest request) {

        Page<ProductListResponse> results = productSearchService.searchProducts(request);
        return ResponseEntity.ok(results);
    }

    /**
     * 검색 자동완성 (워커)
     */
    @GetMapping("/walkers/autocomplete")
    public ResponseEntity<Map<String, Object>> getWalkerAutoComplete(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {

        WalkerSearchRequest request = new WalkerSearchRequest();
        request.setKeyword(query);
        request.setSize(limit);

        Page<WalkerProfileResponse> results = walkerSearchService.searchWalkers(request, authentication);

        Map<String, Object> response = new HashMap<>();
        response.put("suggestions", results.getContent().stream()
                .map(walker -> Map.of(
                    "id", walker.getId(),
                    "name", walker.getUser() != null ? walker.getUser().getName() : "",
                    "serviceArea", walker.getServiceArea() != null ? walker.getServiceArea() : "",
                    "rating", walker.getRating() != null ? walker.getRating() : 0.0
                ))
                .toArray());

        return ResponseEntity.ok(response);
    }

    /**
     * 검색 자동완성 (상품)
     */
    @GetMapping("/products/autocomplete")
    public ResponseEntity<Map<String, Object>> getProductAutoComplete(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {

        ProductSearchRequest request = new ProductSearchRequest();
        request.setKeyword(query);
        request.setSize(limit);

        Page<ProductListResponse> results = productSearchService.searchProducts(request);

        Map<String, Object> response = new HashMap<>();
        response.put("suggestions", results.getContent().stream()
                .map(product -> Map.of(
                    "id", product.getId(),
                    "name", product.getName(),
                    "brand", product.getBrand() != null ? product.getBrand() : "",
                    "price", product.getPrice(),
                    "imageUrl", product.getImageUrls() != null && !product.getImageUrls().isEmpty() ?
                               product.getImageUrls().get(0) : ""
                ))
                .toArray());

        return ResponseEntity.ok(response);
    }

    /**
     * 인기 검색어 (임시 구현 - 추후 실제 검색 로그 기반으로 개선)
     */
    @GetMapping("/popular-keywords")
    public ResponseEntity<Map<String, Object>> getPopularKeywords() {
        Map<String, Object> response = new HashMap<>();

        // 워커 관련 인기 검색어
        response.put("walkers", new String[]{
            "강남구", "산책전문", "대형견", "응급처치", "펫시터", "주말가능"
        });

        // 상품 관련 인기 검색어
        response.put("products", new String[]{
            "강아지사료", "고양이간식", "펫토이", "목줄", "방석", "샴푸", "영양제"
        });

        return ResponseEntity.ok(response);
    }

    /**
     * 검색 필터 옵션 정보
     */
    @GetMapping("/filters")
    public ResponseEntity<Map<String, Object>> getFilterOptions() {
        Map<String, Object> response = new HashMap<>();

        // 워커 필터 옵션
        Map<String, Object> walkerFilters = new HashMap<>();
        walkerFilters.put("experienceLevels", new String[]{"초급", "중급", "고급", "전문가"});
        walkerFilters.put("petTypes", new String[]{"강아지", "고양이", "소동물", "모든동물"});
        walkerFilters.put("certifications", new String[]{"반려동물관리사", "펫시터자격증", "수의테크니션", "응급처치"});
        walkerFilters.put("maxDistances", new Integer[]{5, 10, 20, 30});

        // 상품 필터 옵션
        Map<String, Object> productFilters = new HashMap<>();
        productFilters.put("petTypes", new String[]{"강아지", "고양이", "소동물", "조류", "파충류"});
        productFilters.put("petSizes", new String[]{"소형", "중형", "대형"});
        productFilters.put("petAges", new String[]{"퍼피", "어덜트", "시니어"});
        productFilters.put("materials", new String[]{"천연", "유기농", "무첨가", "프리미엄"});
        productFilters.put("features", new String[]{"알레르기프리", "그레인프리", "저칼로리", "고단백"});

        response.put("walkers", walkerFilters);
        response.put("products", productFilters);

        return ResponseEntity.ok(response);
    }
}