package com.petmily.backend.api.walker.dto.walking;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class WalkingPathResponse {
    private Long bookingId;
    private List<WalkingTrackResponse> trackPoints;
    private WalkingStatistics statistics;

    @Data
    @Builder
    public static class WalkingStatistics {
        private Double totalDistance;        // 총 거리 (km)
        private Long totalDuration;         // 총 시간 (분)
        private Double averageSpeed;        // 평균 속도 (km/h)
        private Double maxSpeed;            // 최대 속도 (km/h)
        private LocalDateTime startTime;    // 시작 시간
        private LocalDateTime endTime;      // 종료 시간
        private Integer totalPoints;        // 총 위치 포인트 수
        private String walkingRoute;        // 경로 요약 (텍스트)
    }
}