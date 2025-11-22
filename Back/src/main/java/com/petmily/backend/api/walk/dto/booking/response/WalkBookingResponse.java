package com.petmily.backend.api.walker.dto.walkerBooking;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(builder = WalkerBookingResponse.WalkerBookingResponseBuilder.class)
public class WalkerBookingResponse {
    private Long id;
    private Long userId;
    private Long walkerId;
    private Long petId;
    private LocalDateTime date;
    private Integer duration;
    private WalkerBooking.BookingStatus status;
    private Double totalPrice;
    private String notes;
    
    // Location and tracking
    private String walkerLocation;
    private String walkStartLocation;
    private String walkEndLocation;
    
    // Photo verification
    private String startPhotoUrl;
    private String middlePhotoUrl;
    private String endPhotoUrl;
    
    // Walk timing
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    
    // Insurance and safety
    private Boolean insuranceCovered;
    private String emergencyContact;
    
    // Regular package
    private Boolean isRegularPackage;
    private String packageFrequency;
    
    // Booking method and locations
    private WalkerBooking.BookingMethod bookingMethod;
    private String pickupLocation;
    private String pickupAddress;
    private String dropoffLocation;
    private String dropoffAddress;
    
    // Walker info
    private String walkerUsername;
    private String walkerName;
    
    // User info
    private String username;
    
    public static WalkerBookingResponse from(WalkerBooking booking) {
        return WalkerBookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .walkerId(booking.getWalkerId())
                .petId(booking.getPetId())
                .date(booking.getDate())
                .duration(booking.getDuration())
                .status(booking.getStatus())
                .totalPrice(booking.getTotalPrice())
                .notes(booking.getNotes())
                .walkerLocation(booking.getWalkerLocation())
                .walkStartLocation(booking.getWalkStartLocation())
                .walkEndLocation(booking.getWalkEndLocation())
                .startPhotoUrl(booking.getStartPhotoUrl())
                .middlePhotoUrl(booking.getMiddlePhotoUrl())
                .endPhotoUrl(booking.getEndPhotoUrl())
                .actualStartTime(booking.getActualStartTime())
                .actualEndTime(booking.getActualEndTime())
                .insuranceCovered(booking.getInsuranceCovered())
                .emergencyContact(booking.getEmergencyContact())
                .isRegularPackage(booking.getIsRegularPackage())
                .packageFrequency(booking.getPackageFrequency())
                .bookingMethod(booking.getBookingMethod())
                .pickupLocation(booking.getPickupLocation())
                .pickupAddress(booking.getPickupAddress())
                .dropoffLocation(booking.getDropoffLocation())
                .dropoffAddress(booking.getDropoffAddress())
                .walkerUsername(booking.getWalker() != null && booking.getWalker().getUser() != null ? 
                    booking.getWalker().getUser().getUsername() : null)
                .walkerName(booking.getWalker() != null && booking.getWalker().getUser() != null ? 
                    booking.getWalker().getUser().getName() : null)
                .username(booking.getUser() != null ? booking.getUser().getUsername() : null)
                .build();
    }
}