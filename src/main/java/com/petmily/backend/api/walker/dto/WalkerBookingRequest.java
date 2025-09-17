package com.petmily.backend.api.walker.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WalkerBookingRequest {
    private Long walkerId;
    private Long petId;
    private LocalDateTime date;
    private Integer duration; // 분 단위
    private String notes;
    private String emergencyContact;
    
    // Regular package fields
    private Boolean isRegularPackage = false;
    private String packageFrequency; // DAILY, WEEKLY, MONTHLY
}