package com.petmily.backend.domain.walk.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "walk_details")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class WalkDetail extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "walk_booking_id")
    private Long walkBookingId;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Column(name = "walker_location")
    private String walkerLocation;

    @Column(name = "walk_start_location")
    private String walkStartLocation;

    @Column(name = "walk_end_location")
    private String walkEndLocation;

    @Column(name = "walking_route", columnDefinition = "TEXT")
    private String walkingRoute; // GPS 경로 데이터 (JSON 형태)

    @Column(name = "total_distance")
    private Double totalDistance; // km 단위

    @Column(name = "weather_condition")
    private String weatherCondition;

    @Column(name = "temperature")
    private Integer temperature; // 섭씨 온도

    @Column(name = "special_incidents", columnDefinition = "TEXT")
    private String specialIncidents; // 특이사항

    @Enumerated(EnumType.STRING)
    @Column(name = "walk_status")
    @Builder.Default
    private WalkStatus walkStatus = WalkStatus.NOT_STARTED;

    // Relations
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "walk_booking_id", insertable = false, updatable = false)
    private WalkBooking walkBooking;

    public enum WalkStatus {
        NOT_STARTED,    // 시작 전
        IN_PROGRESS,    // 진행 중
        PAUSED,         // 일시 정지
        COMPLETED,      // 완료
        INTERRUPTED     // 중단됨
    }
}