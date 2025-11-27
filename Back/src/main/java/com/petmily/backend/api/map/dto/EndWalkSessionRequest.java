package com.petmily.backend.api.map.dto;

import lombok.Data;

@Data
public class EndWalkSessionRequest {
    private Double endLatitude;
    private Double endLongitude;
    private Double totalDistance;
    private Long durationSeconds;
}



