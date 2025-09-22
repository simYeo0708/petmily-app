package com.petmily.backend.api.walker.dto.walking;

import com.petmily.backend.domain.walker.entity.WalkingTrack;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LocationTrackRequest {
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
    private Double accuracy;
    private WalkingTrack.TrackType trackType;
    private Double speed;
    private Double altitude;
}