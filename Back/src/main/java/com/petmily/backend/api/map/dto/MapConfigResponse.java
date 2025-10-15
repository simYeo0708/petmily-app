package com.petmily.backend.api.map.dto;

import lombok.Data;

@Data
public class MapConfigResponse {
    private String kakaoMapApiKey;
    private String mapCenterLat;
    private String mapCenterLon;
    private Integer mapZoomLevel;
}

