package com.petmily.backend.api.walker.dto.walker;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class WalkerSearchRequest {
    // 기존 필드들
    private String serviceArea;
    private Double minRating;
    private Double maxRating;
    private Double userLatitude;
    private Double userLongitude;
    private boolean favoritesOnly = false;

    // 새로운 고급 필터들
    private String keyword; // 워커 이름이나 소개글 검색
    private BigDecimal minHourlyRate; // 최소 시급
    private BigDecimal maxHourlyRate; // 최대 시급
    private Double maxDistanceKm; // 최대 거리 (km)
    private List<String> petTypes; // 가능한 펫 타입들
    private List<String> certifications; // 보유 자격증
    private Boolean isInsured; // 보험 가입 여부
    private Boolean instantBooking; // 즉시 예약 가능 여부
    private Boolean weekendAvailable; // 주말 가능 여부
    private Boolean emergencyService; // 응급 서비스 가능 여부

    // 정렬 옵션
    private SortBy sortBy = SortBy.DISTANCE;
    private SortDirection sortDirection = SortDirection.ASC;

    // 페이징
    private Integer page = 0;
    private Integer size = 20;

    public enum SortBy {
        DISTANCE,       // 거리순
        RATING,         // 평점순
        HOURLY_RATE,    // 시급순
        REVIEWS_COUNT,  // 리뷰 수순
        EXPERIENCE,     // 경력순
        CREATED_DATE    // 등록일순
    }

    public enum SortDirection {
        ASC,  // 오름차순
        DESC  // 내림차순
    }
}
