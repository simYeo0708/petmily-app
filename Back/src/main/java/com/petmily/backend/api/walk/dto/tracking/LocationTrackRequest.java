package com.petmily.backend.api.walk.dto.tracking;

import com.petmily.backend.domain.walk.entity.WalkTrack;
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
    private WalkTrack.TrackType trackType;
    private Double speed;
    private Double altitude;
}