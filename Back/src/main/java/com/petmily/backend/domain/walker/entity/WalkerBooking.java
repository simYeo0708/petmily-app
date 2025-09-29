package com.petmily.backend.domain.walker.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.pet.entity.Pet;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "walker_bookings")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class WalkerBooking extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "user_id")
    private Long userId;
    
    @NotNull
    @Column(name = "walker_id")
    private Long walkerId;
    
    @NotNull
    @Column(name = "pet_id")
    private Long petId;
    
    @NotNull
    @Column(name = "date")
    private LocalDateTime date;
    
    @NotNull
    @Positive
    @Column(name = "duration")
    private Integer duration;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;
    
    @NotNull
    @Positive
    @Column(name = "total_price")
    private Double totalPrice;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "walker_location")
    private String walkerLocation;
    
    @Column(name = "walk_start_location")
    private String walkStartLocation;
    
    @Column(name = "walk_end_location") 
    private String walkEndLocation;
    
    @Column(name = "start_photo_url")
    private String startPhotoUrl;
    
    @Column(name = "middle_photo_url") 
    private String middlePhotoUrl;
    
    @Column(name = "end_photo_url")
    private String endPhotoUrl;
    
    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;
    
    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;
    
    @Column(name = "insurance_covered")
    @Builder.Default
    private Boolean insuranceCovered = true;
    
    @Column(name = "emergency_contact")
    private String emergencyContact;
    
    @Column(name = "is_regular_package")
    @Builder.Default
    private Boolean isRegularPackage = false;
    
    @Column(name = "package_frequency")
    private String packageFrequency;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_method")
    @Builder.Default
    private BookingMethod bookingMethod = BookingMethod.WALKER_SELECTION;
    
    @Column(name = "pickup_location")
    private String pickupLocation;
    
    @Column(name = "pickup_address")
    private String pickupAddress;
    
    @Column(name = "dropoff_location")
    private String dropoffLocation;
    
    @Column(name = "dropoff_address")
    private String dropoffAddress;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "walker_id", insertable = false, updatable = false)
    private WalkerProfile walker;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", insertable = false, updatable = false)
    private Pet pet;
    
    
    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        WALKER_APPLIED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        REJECTED
    }
    
    public enum BookingMethod {
        WALKER_SELECTION,
        OPEN_REQUEST
    }
}

