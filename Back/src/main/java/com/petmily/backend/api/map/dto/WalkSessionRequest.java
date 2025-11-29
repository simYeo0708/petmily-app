package com.petmily.backend.api.map.dto;

import lombok.Data;

@Data
public class WalkSessionRequest {
    private Long bookingId; // 워커와 함께하는 산책인 경우 (선택)
    private Double startLatitude;
    private Double startLongitude;
}



