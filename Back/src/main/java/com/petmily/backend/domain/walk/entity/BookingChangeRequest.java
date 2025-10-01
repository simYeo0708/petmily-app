package com.petmily.backend.domain.walk.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "booking_change_requests")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class BookingChangeRequest extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "requested_by_user_id", nullable = false)
    private Long requestedByUserId;

    @Column(name = "new_date")
    private LocalDateTime newDate;

    @Column(name = "new_duration")
    private Integer newDuration;

    @Column(name = "new_price")
    private Double newPrice;

    @Column(name = "new_pickup_location")
    private String newPickupLocation;

    @Column(name = "new_pickup_address")
    private String newPickupAddress;

    @Column(name = "new_dropoff_location")
    private String newDropoffLocation;

    @Column(name = "new_dropoff_address")
    private String newDropoffAddress;

    @Column(name = "new_notes", columnDefinition = "TEXT")
    private String newNotes;

    @Column(name = "new_insurance_covered")
    private Boolean newInsuranceCovered;

    @Column(name = "change_reason", columnDefinition = "TEXT")
    private String changeReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ChangeRequestStatus status = ChangeRequestStatus.PENDING;

    @Column(name = "walker_response", columnDefinition = "TEXT")
    private String walkerResponse; // 수정필요******************

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", insertable = false, updatable = false)
    private WalkBooking booking;

    public enum ChangeRequestStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}