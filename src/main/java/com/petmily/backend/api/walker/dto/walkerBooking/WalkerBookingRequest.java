package com.petmily.backend.api.walker.dto.walkerBooking;

import com.petmily.backend.domain.walker.entity.WalkerBooking;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WalkerBookingRequest {
    private Long walkerId; // 워커 선택형에서만 필요
    private Long petId;
    private LocalDateTime date;
    private Integer duration; // 분 단위
    private String notes;
    private String emergencyContact;
    
    // Booking method
    private WalkerBooking.BookingMethod bookingMethod = WalkerBooking.BookingMethod.WALKER_SELECTION;
    
    // For open requests
    private String pickupLocation; // 위도,경도 형태
    private String pickupAddress; // 실제 주소
    
    // Optional dropoff location (null if same as pickup)
    private String dropoffLocation; // 위도,경도 형태
    private String dropoffAddress; // 실제 주소
    
    // Regular package fields
    private Boolean isRegularPackage = false;
    private String packageFrequency; // DAILY, WEEKLY, MONTHLY
}