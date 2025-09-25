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
@Builder
public class WalkingTrack extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long bookingId;

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


    public enum TrackType {
        START,    // 산책 시작점
        WALKING,  // 산책 중
        PAUSE,    // 일시 정지
        RESUME,   // 재개
        END       // 산책 종료점
    }
}