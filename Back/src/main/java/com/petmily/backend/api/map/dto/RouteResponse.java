package com.petmily.backend.api.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteResponse {
    private Long walkSessionId;
    private List<RoutePoint> points;
    private Double totalDistance;
    private Long durationSeconds;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoutePoint {
        private Double latitude;
        private Double longitude;
        private Long timestamp;
        private Double accuracy;
        private Double speed;
        private Double altitude;
    }
}

