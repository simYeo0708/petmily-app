package com.petmily.backend.api.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalkSessionResponse {
    private Long id;
    private Long userId;
    private Long bookingId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double totalDistance;
    private Long durationSeconds;
    private String status;
    private Double startLatitude;
    private Double startLongitude;
    private Double endLatitude;
    private Double endLongitude;
}


