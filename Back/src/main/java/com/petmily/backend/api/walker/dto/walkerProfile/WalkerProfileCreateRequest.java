package com.petmily.backend.api.walker.dto.walkerProfile;

import lombok.Data;

@Data
public class WalkerProfileCreateRequest {
    private String bio; // Self-introduction
    private String experience; // Pet experience details
    private String availableTime; // e.g., "Mon-Fri 9-5"
    private String serviceArea; // e.g., "Gangnam-gu"
    // Add other fields necessary for initial walker registration
}
