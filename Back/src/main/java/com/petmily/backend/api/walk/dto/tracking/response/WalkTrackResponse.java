package com.petmily.backend.api.walk.dto.tracking.response;

import com.petmily.backend.domain.walk.entity.WalkTrack;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WalkTrackResponse {
    private Long id;
    private Long bookingId;
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
    private Double accuracy;
    private WalkTrack.TrackType trackType;
    private Double speed;
    private Double altitude;

    public static WalkTrackResponse from(WalkTrack walkTrack) {
        return WalkTrackResponse.builder()
                .id(walkTrack.getId())
                .bookingId(walkTrack.getBookingId())
                .latitude(walkTrack.getLatitude())
                .longitude(walkTrack.getLongitude())
                .timestamp(walkTrack.getTimestamp())
                .accuracy(walkTrack.getAccuracy())
                .trackType(walkTrack.getTrackType())
                .speed(walkTrack.getSpeed())
                .altitude(walkTrack.getAltitude())
                .build();
    }
}