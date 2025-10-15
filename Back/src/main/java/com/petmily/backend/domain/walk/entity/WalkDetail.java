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
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Column(name = "total_distance")
    private Double totalDistance; // km 단위

    @Column(name = "special_incidents", columnDefinition = "TEXT")
    private String specialIncidents; // 특이사항

    @Column(name = "start_photo_url")
    private String startPhotoUrl;

    @Column(name = "middle_photo_url")
    private String middlePhotoUrl;

    @Column(name = "end_photo_url")
    private String endPhotoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "walk_status")
    @Builder.Default
    private WalkStatus walkStatus = WalkStatus.NOT_STARTED;

    // Relations
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", insertable = false, updatable = false)
    private WalkBooking walkBooking;

    public enum WalkStatus {
        NOT_STARTED,    // 시작 전
        IN_PROGRESS,    // 진행 중
        PAUSED,         // 일시 정지
        COMPLETED,      // 완료
        INTERRUPTED     // 중단됨
    }
}