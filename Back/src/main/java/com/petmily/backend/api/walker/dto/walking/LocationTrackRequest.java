package com.petmily.backend.api.walker.dto.walking;

import com.petmily.backend.domain.walker.entity.WalkingTrack;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationTrackRequest {
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
    private Double accuracy;
    private WalkingTrack.TrackType trackType;
    private Double speed;
    private Double altitude;
}