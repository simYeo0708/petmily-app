package com.petmily.backend.api.walker.dto.walkerBooking;

import com.petmily.backend.domain.walker.entity.WalkingTrack;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WalkingTrackResponse {
    private Long id;
    private Long bookingId;
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
    private Double accuracy;
    private WalkingTrack.TrackType trackType;
    private Double speed;
    private Double altitude;

    public static WalkingTrackResponse from(WalkingTrack walkingTrack) {
        return WalkingTrackResponse.builder()
                .id(walkingTrack.getId())
                .bookingId(walkingTrack.getBookingId())
                .latitude(walkingTrack.getLatitude())
                .longitude(walkingTrack.getLongitude())
                .timestamp(walkingTrack.getTimestamp())
                .accuracy(walkingTrack.getAccuracy())
                .trackType(walkingTrack.getTrackType())
                .speed(walkingTrack.getSpeed())
                .altitude(walkingTrack.getAltitude())
                .build();
    }
}