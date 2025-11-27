package com.petmily.backend.domain.walker.entity;

import com.petmily.backend.domain.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "walk_sessions")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WalkSession extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "booking_id")
    private Long bookingId; // 워커와 함께하는 산책인 경우

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "total_distance", columnDefinition = "DECIMAL(10,2)")
    @Builder.Default
    private Double totalDistance = 0.0; // 총 거리 (미터)

    @Column(name = "duration_seconds")
    private Long durationSeconds; // 산책 시간 (초)

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private WalkSessionStatus status = WalkSessionStatus.IN_PROGRESS;

    @Column(name = "start_latitude", columnDefinition = "DECIMAL(10,7)")
    private Double startLatitude;

    @Column(name = "start_longitude", columnDefinition = "DECIMAL(10,7)")
    private Double startLongitude;

    @Column(name = "end_latitude", columnDefinition = "DECIMAL(10,7)")
    private Double endLatitude;

    @Column(name = "end_longitude", columnDefinition = "DECIMAL(10,7)")
    private Double endLongitude;

    public enum WalkSessionStatus {
        IN_PROGRESS,  // 진행 중
        COMPLETED,    // 완료
        CANCELLED     // 취소
    }

    public void complete(LocalDateTime endTime, Double endLatitude, Double endLongitude, Double totalDistance, Long durationSeconds) {
        this.endTime = endTime;
        this.endLatitude = endLatitude;
        this.endLongitude = endLongitude;
        this.totalDistance = totalDistance;
        this.durationSeconds = durationSeconds;
        this.status = WalkSessionStatus.COMPLETED;
    }

    public void cancel() {
        this.status = WalkSessionStatus.CANCELLED;
        if (this.endTime == null) {
            this.endTime = LocalDateTime.now();
        }
    }
}


