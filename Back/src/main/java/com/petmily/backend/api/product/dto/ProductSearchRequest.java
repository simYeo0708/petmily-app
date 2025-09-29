package com.petmily.backend.api.product.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductSearchRequest {
    // 기본 검색 (기존 유지)
    private String keyword; // 상품명, 설명, 브랜드 검색
    private Long categoryId; // 카테고리 ID
    private String brand; // 브랜드명
    private Boolean isActive = true;

    // 가격 필터 (기존 개선)
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // 새로운 고급 필터들
    // 평점 필터
    private Double minRating;
    private Double maxRating;

    // 상품 상태 필터
    private Boolean inStock; // 재고 있는 상품만
    private Boolean onSale; // 할인 상품만
    private Boolean newArrival; // 신상품 (최근 30일)
    private Boolean freeShipping; // 무료배송 상품

    // 펫 관련 필터
    private List<String> petTypes; // 강아지, 고양이 등
    private List<String> petSizes; // 소형, 중형, 대형
    private List<String> petAges; // 퍼피, 성견, 시니어

    // 상품 속성 필터
    private List<String> materials; // 소재 (천연, 유기농 등)
    private List<String> features; // 특징 (알레르기 프리, 그레인 프리 등)
    private String origin; // 원산지

    // 리뷰 관련 필터
    private Integer minReviewCount; // 최소 리뷰 수
    private Boolean hasPhotos; // 포토 리뷰가 있는 상품

    // 정렬 옵션 (기존 개선)
    private SortBy sortBy = SortBy.CREATED_DATE;
    private SortDirection sortDirection = SortDirection.DESC;

    // 페이징
    private Integer page = 0;
    private Integer size = 24;

    public enum SortBy {
        RELEVANCE,      // 관련도순 (키워드 매칭도)
        PRICE,          // 가격순
        RATING,         // 평점순
        REVIEWS_COUNT,  // 리뷰 수순
        SALES_COUNT,    // 판매량순
        CREATED_DATE,   // 등록일순 (기존 createTime)
        DISCOUNT_RATE   // 할인율순
    }

    public enum SortDirection {
        ASC,  // 오름차순
        DESC  // 내림차순
    }

    // Enum 반환 메소드들 (새로운 버전)
    public SortBy getSortByEnum() {
        return this.sortBy;
    }

    public SortDirection getSortDirectionEnum() {
        return this.sortDirection;
    }

    // 기존 호환성을 위한 메소드들 (Deprecated)
    @Deprecated
    public String getSortBy() {
        return this.sortBy.name().toLowerCase();
    }

    @Deprecated
    public void setSortBy(String sortBy) {
        try {
            this.sortBy = SortBy.valueOf(sortBy.toUpperCase());
        } catch (IllegalArgumentException e) {
            this.sortBy = SortBy.CREATED_DATE;
        }
    }

    @Deprecated
    public String getSortDirection() {
        return this.sortDirection.name().toLowerCase();
    }

    @Deprecated
    public void setSortDirection(String sortDirection) {
        try {
            this.sortDirection = SortDirection.valueOf(sortDirection.toUpperCase());
        } catch (IllegalArgumentException e) {
            this.sortDirection = SortDirection.DESC;
        }
    }

    // BigDecimal <-> Double 호환성
    @Deprecated
    public Double getMinPrice() {
        return this.minPrice != null ? this.minPrice.doubleValue() : null;
    }

    @Deprecated
    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice != null ? BigDecimal.valueOf(minPrice) : null;
    }

    @Deprecated
    public Double getMaxPrice() {
        return this.maxPrice != null ? this.maxPrice.doubleValue() : null;
    }

    @Deprecated
    public void setMaxPrice(Double maxPrice) {
        this.maxPrice = maxPrice != null ? BigDecimal.valueOf(maxPrice) : null;
    }
}