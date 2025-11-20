package com.petmily.backend.domain.walker.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "walking_tracks")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class WalkingTrack extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Long bookingId; // 워커와 함께하는 산책인 경우

    @Column(name = "walk_session_id")
    private Long walkSessionId; // 독립적인 산책 세션인 경우

    @Column(nullable = false, columnDefinition = "DECIMAL(10,7)")
    private Double latitude;

    @Column(nullable = false, columnDefinition = "DECIMAL(10,7)")
    private Double longitude;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(columnDefinition = "DECIMAL(5,2)")
    private Double accuracy; // GPS 정확도 (미터)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrackType trackType;

    @Column(columnDefinition = "DECIMAL(5,2)")
    private Double speed; // 속도 (km/h)

    @Column(columnDefinition = "DECIMAL(5,2)")
    private Double altitude; // 고도 (미터)

    @Builder
    public WalkingTrack(Long bookingId, Long walkSessionId, Double latitude, Double longitude, 
                       LocalDateTime timestamp, Double accuracy, TrackType trackType,
                       Double speed, Double altitude) {
        this.bookingId = bookingId;
        this.walkSessionId = walkSessionId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
        this.accuracy = accuracy;
        this.trackType = trackType;
        this.speed = speed;
        this.altitude = altitude;
    }

    public enum TrackType {
        START,    // 산책 시작점
        WALKING,  // 산책 중
        PAUSE,    // 일시 정지
        RESUME,   // 재개
        END       // 산책 종료점
    }
}