package com.petmily.backend.api.product.service;

import com.petmily.backend.api.product.dto.ProductListResponse;
import com.petmily.backend.api.product.dto.ProductSearchRequest;
import com.petmily.backend.domain.product.entity.Product;
import com.petmily.backend.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductSearchService {

    private final ProductRepository productRepository;

    /**
     * 고급 상품 검색
     */
    public Page<ProductListResponse> searchProducts(ProductSearchRequest request) {
        // 1. 기본 상품 리스트 가져오기
        List<Product> products = getBaseProductList(request);

        // 2. 필터링 적용
        List<Product> filteredProducts = applyFilters(products, request);

        // 3. 정렬 적용
        List<Product> sortedProducts = applySorting(filteredProducts, request);

        // 4. 페이징 적용
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        return applyPagination(sortedProducts, pageable);
    }

    /**
     * 기본 상품 리스트 가져오기
     */
    private List<Product> getBaseProductList(ProductSearchRequest request) {
        if (request.getCategoryId() != null) {
            // 카테고리별 조회
            return productRepository.findByCategoryIdAndIsActiveTrue(request.getCategoryId());
        } else if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
            // 키워드 검색 (상품명, 설명에서 검색)
            return productRepository.findByKeywordAndIsActiveTrue(request.getKeyword().trim());
        } else {
            // 전체 상품
            return productRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        }
    }

    /**
     * 필터링 적용
     */
    private List<Product> applyFilters(List<Product> products, ProductSearchRequest request) {
        return products.stream()
                .filter(product -> applyBasicFilters(product, request))
                .filter(product -> applyPriceFilter(product, request))
                .filter(product -> applyRatingFilter(product, request))
                .filter(product -> applyStockFilter(product, request))
                .filter(product -> applySaleFilter(product, request))
                .filter(product -> applyNewArrivalFilter(product, request))
                .filter(product -> applyFreeShippingFilter(product, request))
                .filter(product -> applyPetFilters(product, request))
                .filter(product -> applyAttributeFilters(product, request))
                .filter(product -> applyReviewFilters(product, request))
                .collect(Collectors.toList());
    }

    // 개별 필터 메소드들
    private boolean applyBasicFilters(Product product, ProductSearchRequest request) {
        // 활성 상태 체크
        if (request.getIsActive() != null && !request.getIsActive().equals(product.getIsActive())) {
            return false;
        }

        // 브랜드 필터
        if (request.getBrand() != null && !request.getBrand().trim().isEmpty()) {
            if (product.getBrand() == null ||
                !product.getBrand().toLowerCase().contains(request.getBrand().toLowerCase())) {
                return false;
            }
        }

        return true;
    }

    private boolean applyPriceFilter(Product product, ProductSearchRequest request) {
        if (request.getMinPrice() != null &&
            (product.getPrice() == null || product.getPrice().compareTo(request.getMinPrice()) < 0)) {
            return false;
        }

        if (request.getMaxPrice() != null &&
            (product.getPrice() == null || product.getPrice().compareTo(request.getMaxPrice()) > 0)) {
            return false;
        }

        return true;
    }

    private boolean applyRatingFilter(Product product, ProductSearchRequest request) {
        if (request.getMinRating() != null &&
            (product.getAverageRating() == null || product.getAverageRating() < request.getMinRating())) {
            return false;
        }

        if (request.getMaxRating() != null &&
            (product.getAverageRating() == null || product.getAverageRating() > request.getMaxRating())) {
            return false;
        }

        return true;
    }

    private boolean applyStockFilter(Product product, ProductSearchRequest request) {
        if (request.getInStock() != null && request.getInStock()) {
            return product.getStockQuantity() != null && product.getStockQuantity() > 0;
        }
        return true;
    }

    private boolean applySaleFilter(Product product, ProductSearchRequest request) {
        if (request.getOnSale() != null && request.getOnSale()) {
            return product.getDiscountRate() != null && product.getDiscountRate() > 0;
        }
        return true;
    }

    private boolean applyNewArrivalFilter(Product product, ProductSearchRequest request) {
        if (request.getNewArrival() != null && request.getNewArrival()) {
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            return product.getCreatedAt() != null && product.getCreatedAt().isAfter(thirtyDaysAgo);
        }
        return true;
    }

    private boolean applyFreeShippingFilter(Product product, ProductSearchRequest request) {
        if (request.getFreeShipping() != null && request.getFreeShipping()) {
            return product.getIsFreeShipping() != null && product.getIsFreeShipping();
        }
        return true;
    }

    private boolean applyPetFilters(Product product, ProductSearchRequest request) {
        // 펫 타입 필터
        if (request.getPetTypes() != null && !request.getPetTypes().isEmpty()) {
            if (product.getPetType() == null ||
                !request.getPetTypes().contains(product.getPetType())) {
                return false;
            }
        }

        // 펫 사이즈 필터
        if (request.getPetSizes() != null && !request.getPetSizes().isEmpty()) {
            if (product.getPetSize() == null) {
                return false;
            }

            List<String> productSizes = Arrays.asList(product.getPetSize().split(","));
            boolean hasMatchingSize = productSizes.stream()
                    .anyMatch(size -> request.getPetSizes().contains(size.trim()));

            if (!hasMatchingSize) {
                return false;
            }
        }

        // 펫 연령 필터
        if (request.getPetAges() != null && !request.getPetAges().isEmpty()) {
            if (product.getPetAge() == null) {
                return false;
            }

            List<String> productAges = Arrays.asList(product.getPetAge().split(","));
            boolean hasMatchingAge = productAges.stream()
                    .anyMatch(age -> request.getPetAges().contains(age.trim()));

            if (!hasMatchingAge) {
                return false;
            }
        }

        return true;
    }

    private boolean applyAttributeFilters(Product product, ProductSearchRequest request) {
        // 소재 필터
        if (request.getMaterials() != null && !request.getMaterials().isEmpty()) {
            if (product.getMaterial() == null) {
                return false;
            }

            List<String> productMaterials = Arrays.asList(product.getMaterial().split(","));
            boolean hasMatchingMaterial = productMaterials.stream()
                    .anyMatch(material -> request.getMaterials().contains(material.trim()));

            if (!hasMatchingMaterial) {
                return false;
            }
        }

        // 특징 필터
        if (request.getFeatures() != null && !request.getFeatures().isEmpty()) {
            if (product.getFeatures() == null) {
                return false;
            }

            List<String> productFeatures = Arrays.asList(product.getFeatures().split(","));
            boolean hasMatchingFeature = productFeatures.stream()
                    .anyMatch(feature -> request.getFeatures().contains(feature.trim()));

            if (!hasMatchingFeature) {
                return false;
            }
        }

        // 원산지 필터
        if (request.getOrigin() != null && !request.getOrigin().trim().isEmpty()) {
            if (product.getOrigin() == null ||
                !product.getOrigin().toLowerCase().contains(request.getOrigin().toLowerCase())) {
                return false;
            }
        }

        return true;
    }

    private boolean applyReviewFilters(Product product, ProductSearchRequest request) {
        // 최소 리뷰 수 필터
        if (request.getMinReviewCount() != null) {
            if (product.getReviewsCount() == null || product.getReviewsCount() < request.getMinReviewCount()) {
                return false;
            }
        }

        // 포토 리뷰 필터 (임시로 리뷰 수가 있으면 포토 리뷰가 있다고 가정)
        if (request.getHasPhotos() != null && request.getHasPhotos()) {
            return product.getReviewsCount() != null && product.getReviewsCount() > 0;
        }

        return true;
    }

    /**
     * 정렬 적용
     */
    private List<Product> applySorting(List<Product> products, ProductSearchRequest request) {
        Comparator<Product> comparator = getComparator(request);

        if (request.getSortDirection() == ProductSearchRequest.SortDirection.DESC) {
            comparator = comparator.reversed();
        }

        return products.stream()
                .sorted(comparator)
                .collect(Collectors.toList());
    }

    private Comparator<Product> getComparator(ProductSearchRequest request) {
        switch (request.getSortBy()) {
            case RELEVANCE:
                // 키워드 관련도 정렬 (키워드가 있는 경우)
                return getRelevanceComparator(request.getKeyword());
            case PRICE:
                return Comparator.comparing(Product::getPrice, Comparator.nullsLast(java.math.BigDecimal::compareTo));
            case RATING:
                return Comparator.comparing(Product::getAverageRating, Comparator.nullsLast(Double::compareTo));
            case REVIEWS_COUNT:
                return Comparator.comparing(Product::getReviewsCount, Comparator.nullsLast(Integer::compareTo));
            case SALES_COUNT:
                return Comparator.comparing(Product::getSalesCount, Comparator.nullsLast(Integer::compareTo));
            case DISCOUNT_RATE:
                return Comparator.comparing(Product::getDiscountRate, Comparator.nullsLast(Integer::compareTo));
            case CREATED_DATE:
            default:
                return Comparator.comparing(Product::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo));
        }
    }

    private Comparator<Product> getRelevanceComparator(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            // 키워드가 없으면 기본 정렬 (생성일)
            return Comparator.comparing(Product::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo));
        }

        String lowerKeyword = keyword.toLowerCase();

        return (p1, p2) -> {
            int score1 = calculateRelevanceScore(p1, lowerKeyword);
            int score2 = calculateRelevanceScore(p2, lowerKeyword);
            return Integer.compare(score2, score1); // 높은 점수가 먼저 오도록
        };
    }

    private int calculateRelevanceScore(Product product, String keyword) {
        int score = 0;

        // 상품명에 키워드가 포함된 경우 (가중치 높음)
        if (product.getName() != null && product.getName().toLowerCase().contains(keyword)) {
            if (product.getName().toLowerCase().startsWith(keyword)) {
                score += 10; // 상품명이 키워드로 시작하면 더 높은 점수
            } else {
                score += 5;
            }
        }

        // 브랜드에 키워드가 포함된 경우
        if (product.getBrand() != null && product.getBrand().toLowerCase().contains(keyword)) {
            score += 3;
        }

        // 설명에 키워드가 포함된 경우
        if (product.getDescription() != null && product.getDescription().toLowerCase().contains(keyword)) {
            score += 2;
        }

        // 카테고리명에 키워드가 포함된 경우 (카테고리 객체가 있다면)
        if (product.getCategory() != null && product.getCategory().getName() != null &&
            product.getCategory().getName().toLowerCase().contains(keyword)) {
            score += 2;
        }

        return score;
    }

    /**
     * 페이징 적용
     */
    private Page<ProductListResponse> applyPagination(List<Product> products, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), products.size());

        if (start >= products.size()) {
            return new PageImpl<>(new ArrayList<>(), pageable, products.size());
        }

        List<Product> pageContent = products.subList(start, end);
        List<ProductListResponse> responses = pageContent.stream()
                .map(ProductListResponse::from)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, products.size());
    }
}