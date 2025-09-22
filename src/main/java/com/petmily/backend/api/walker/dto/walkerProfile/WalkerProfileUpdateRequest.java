package com.petmily.backend.api.walker.dto.walkerProfile;

import lombok.Data;

@Data
public class WalkerProfileUpdateRequest {
    private boolean isAvailable;
    private String bio;
    private String experience;
    private String availableTime;
    private String serviceArea;
    // Add other fields that a walker can update in their profile
}
