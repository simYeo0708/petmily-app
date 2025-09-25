package com.petmily.backend.api.walker.dto.walkerProfile;

import lombok.Data;

@Data
public class WalkerSearchRequest {
    private String serviceArea;
    private String experienceLevel;
    private Double minRating;
    private Double userLatitude;
    private Double userLongitude;
    private boolean favoritesOnly = false; // 즐겨찾기 워커만 보기
}
