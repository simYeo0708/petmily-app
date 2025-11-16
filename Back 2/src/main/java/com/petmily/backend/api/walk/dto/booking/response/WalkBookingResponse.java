package com.petmily.backend.api.walk.dto.booking.response;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walk.entity.WalkDetail;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(builder = WalkBookingResponse.WalkBookingResponseBuilder.class)
public class WalkBookingResponse {
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
    private String userName;
    
    public static WalkBookingResponse from(WalkBooking booking) {
        return from(booking, null);
    }

    public static WalkBookingResponse from(WalkBooking booking, WalkDetail detail) {
        var builder = WalkBookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .walkerId(booking.getWalkerId())
                .petId(booking.getPetId())
                .date(booking.getDate())
                .duration(booking.getDuration())
                .status(booking.getStatus())
                .totalPrice(booking.getTotalPrice())
                .notes(booking.getNotes())
                .insuranceCovered(booking.getInsuranceCovered())
                .emergencyContact(booking.getUser() != null ? booking.getUser().getEmergencyContactPhone() : null)
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
                .userName(booking.getUser() != null ? booking.getUser().getName() : null);

        // Add WalkDetail fields if present
        if (detail != null) {
            builder
                   .actualStartTime(detail.getActualStartTime())
                   .actualEndTime(detail.getActualEndTime());
        }


        return builder.build();
    }
}