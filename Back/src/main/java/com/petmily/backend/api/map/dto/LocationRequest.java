package com.petmily.backend.api.map.dto;

import lombok.Data;

@Data
public class LocationRequest {
    private Double latitude;
    private Double longitude;
    private Long timestamp;
    private String userId;
    private Long walkSessionId; // 산책 세션 ID
    private Double accuracy; // GPS 정확도 (미터)
    private Double speed; // 속도 (km/h)
    private Double altitude; // 고도 (미터)
}

