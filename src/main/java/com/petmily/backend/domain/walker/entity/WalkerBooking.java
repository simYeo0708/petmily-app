package com.petmily.backend.domain.walker.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "walker_bookings")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
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
    @Column(name = "duration") // 분 단위
    private Integer duration;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BookingStatus status = BookingStatus.PENDING;
    
    @NotNull
    @Positive
    @Column(name = "total_price")
    private Double totalPrice;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    // Location and tracking fields
    @Column(name = "walker_location")
    private String walkerLocation; // latitude,longitude format
    
    @Column(name = "walk_start_location")
    private String walkStartLocation;
    
    @Column(name = "walk_end_location") 
    private String walkEndLocation;
    
    // Photo verification fields
    @Column(name = "start_photo_url")
    private String startPhotoUrl;
    
    @Column(name = "middle_photo_url") 
    private String middlePhotoUrl;
    
    @Column(name = "end_photo_url")
    private String endPhotoUrl;
    
    // Walk timing
    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;
    
    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;
    
    // Insurance and safety
    @Column(name = "insurance_covered")
    private Boolean insuranceCovered = true;
    
    @Column(name = "emergency_contact")
    private String emergencyContact;
    
    // Regular walk package
    @Column(name = "is_regular_package")
    private Boolean isRegularPackage = false;
    
    @Column(name = "package_frequency") // DAILY, WEEKLY, etc.
    private String packageFrequency;
    
    // Booking method
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_method")
    private BookingMethod bookingMethod = BookingMethod.WALKER_SELECTION;
    
    // For open requests - where the request is placed
    @Column(name = "pickup_location")
    private String pickupLocation;
    
    @Column(name = "pickup_address")
    private String pickupAddress;
    
    // Optional dropoff location (if different from pickup)
    @Column(name = "dropoff_location")
    private String dropoffLocation;
    
    @Column(name = "dropoff_address")
    private String dropoffAddress;
    
    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "walker_id", insertable = false, updatable = false)
    private WalkerProfile walker;
    
    // Chat room integration will be added later when ChatRoom entity is implemented
    // @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private ChatRoom chatRoom;
    
    // Enum for Booking Status
    public enum BookingStatus {
        PENDING,        // 예약 요청됨 (워커가 확인해야 함)
        CONFIRMED,      // 워커가 확정함
        WALKER_APPLIED, // 워커가 오픈 요청에 지원함 (사용자가 확인해야 함)
        IN_PROGRESS,    // 산책 진행중
        COMPLETED,      // 산책 완료
        CANCELLED,      // 취소됨
        REJECTED        // 거절됨
    }
    
    // Enum for Booking Method
    public enum BookingMethod {
        WALKER_SELECTION,  // 사용자가 워커를 선택하는 방식
        OPEN_REQUEST      // 오픈 요청 방식 (워커들이 지원)
    }
}

