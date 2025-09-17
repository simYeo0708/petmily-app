package com.petmily.backend.api.walker.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class LocationBatchUpdateRequest {
    private Long bookingId;
    private List<LocationPoint> locations;
    
    @Data
    public static class LocationPoint {
        private Double latitude;
        private Double longitude;
        private LocalDateTime timestamp;
        private Double accuracy; // GPS 정확도 (미터)
        private Double batteryLevel; // 배터리 수준
    }
}