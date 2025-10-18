package com.petmily.backend.api.walk.dto.tracking.response;

import com.petmily.backend.api.map.dto.AddressInfo;
import com.petmily.backend.domain.walk.entity.WalkDetail;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalkStatusResponse {
    // 기본 정보
    private Long bookingId;
    private String petName;
    private String walkerName;

    // 현재 위치
    private WalkTrackResponse currentLocation;
    private AddressInfo currentAddress;
    private Double currentSpeed;

    // 진행 상황
    private LocalDateTime startTime;
    private LocalDateTime estimatedEndTime;
    private Long elapsedMinutes;
    private Long remainingMinutes;
    private Double totalDistanceKm;
    private Double averageSpeed;
    private WalkDetail.WalkStatus walkStatus;

    // 전체 경로
    private List<WalkTrackResponse> path;
    private Integer totalPathPoints;

}
