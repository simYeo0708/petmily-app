package com.petmily.backend.api.map.dto;

import lombok.Data;

@Data
public class LocationRequest {
    private Double latitude;
    private Double longitude;
    private Long timestamp;
    private String userId;
}

