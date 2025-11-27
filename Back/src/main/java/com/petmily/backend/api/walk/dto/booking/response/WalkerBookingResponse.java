package com.petmily.backend.api.walk.dto.booking.response;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.petmily.backend.domain.walk.entity.WalkBooking;
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
    private WalkBooking.BookingStatus status;
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
    private WalkBooking.BookingMethod bookingMethod;
    private String pickupLocation;
    private String pickupAddress;
    private String dropoffLocation;
    private String dropoffAddress;
    
    // Walker info
    private String walkerUsername;
    private String walkerName;
    
    // User info
    private String username;
    
    public static WalkerBookingResponse from(WalkBooking booking) {
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
                .walkerLocation(null) // TODO: WalkDetail에 필드 추가 필요
                .walkStartLocation(null) // TODO: WalkDetail에 필드 추가 필요
                .walkEndLocation(null) // TODO: WalkDetail에 필드 추가 필요
                .startPhotoUrl(booking.getWalkDetail() != null ? booking.getWalkDetail().getStartPhotoUrl() : null)
                .middlePhotoUrl(booking.getWalkDetail() != null ? booking.getWalkDetail().getMiddlePhotoUrl() : null)
                .endPhotoUrl(booking.getWalkDetail() != null ? booking.getWalkDetail().getEndPhotoUrl() : null)
                .actualStartTime(booking.getWalkDetail() != null ? booking.getWalkDetail().getActualStartTime() : null)
                .actualEndTime(booking.getWalkDetail() != null ? booking.getWalkDetail().getActualEndTime() : null)
                .insuranceCovered(booking.getInsuranceCovered())
                .emergencyContact(null) // TODO: WalkDetail에 필드 추가 필요
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