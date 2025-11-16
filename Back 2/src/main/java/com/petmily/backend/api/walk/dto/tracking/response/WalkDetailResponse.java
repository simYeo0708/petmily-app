package com.petmily.backend.api.walk.dto.tracking.response;

import com.petmily.backend.domain.walk.entity.WalkDetail;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalkDetailResponse {
    private Long id;
    private Long bookingId;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private Double totalDistance; // km
    private String specialIncidents;
    private String startPhotoUrl;
    private String middlePhotoUrl;
    private String endPhotoUrl;
    private WalkDetail.WalkStatus walkStatus;

    public static WalkDetailResponse from(WalkDetail detail) {
        if (detail == null) {
            return null;
        }

        return WalkDetailResponse.builder()
                .id(detail.getId())
                .bookingId(detail.getBookingId())
                .actualStartTime(detail.getActualStartTime())
                .actualEndTime(detail.getActualEndTime())
                .totalDistance(detail.getTotalDistance())
                .specialIncidents(detail.getSpecialIncidents())
                .startPhotoUrl(detail.getStartPhotoUrl())
                .middlePhotoUrl(detail.getMiddlePhotoUrl())
                .endPhotoUrl(detail.getEndPhotoUrl())
                .walkStatus(detail.getWalkStatus())
                .build();
    }
}
