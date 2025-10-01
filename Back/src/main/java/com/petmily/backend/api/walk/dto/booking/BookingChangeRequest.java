package com.petmily.backend.api.walk.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingChangeRequest {
    private LocalDateTime newDate;
    private Integer newDuration;
    private Double newPrice;
    private String newPickupLocation;
    private String newPickupAddress;
    private String newDropoffLocation;
    private String newDropoffAddress;
    private String newNotes;
    private Boolean newInsuranceCovered;
    private String changeReason;
}