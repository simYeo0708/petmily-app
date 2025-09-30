package com.petmily.backend.api.walk.dto.booking;

import com.petmily.backend.domain.walk.entity.BookingChangeRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingChangeResponse {
    private Long id;
    private Long bookingId;
    private Long requestedByUserId;
    private LocalDateTime newDate;
    private Integer newDuration;
    private Double newPrice;
    private String newPickupLocation;
    private String newPickupAddress;
    private String newDropoffLocation;
    private String newDropoffAddress;
    private String newNotes;
    private Boolean newInsuranceCovered;
    private String newEmergencyContact;
    private String changeReason;
    private BookingChangeRequest.ChangeRequestStatus status;
    private String walkerResponse;
    private LocalDateTime respondedAt;
    private LocalDateTime requestedAt;

    public static BookingChangeResponse from(BookingChangeRequest request) {
        return BookingChangeResponse.builder()
                .id(request.getId())
                .bookingId(request.getBookingId())
                .requestedByUserId(request.getRequestedByUserId())
                .newDate(request.getNewDate())
                .newDuration(request.getNewDuration())
                .newPrice(request.getNewPrice())
                .newPickupLocation(request.getNewPickupLocation())
                .newPickupAddress(request.getNewPickupAddress())
                .newDropoffLocation(request.getNewDropoffLocation())
                .newDropoffAddress(request.getNewDropoffAddress())
                .newNotes(request.getNewNotes())
                .newInsuranceCovered(request.getNewInsuranceCovered())
                .newEmergencyContact(request.getNewEmergencyContact())
                .changeReason(request.getChangeReason())
                .status(request.getStatus())
                .walkerResponse(request.getWalkerResponse())
                .respondedAt(request.getRespondedAt())
                .requestedAt(request.getCreateTime())
                .build();
    }
}