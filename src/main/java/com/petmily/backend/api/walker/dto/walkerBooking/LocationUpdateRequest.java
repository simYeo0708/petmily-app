package com.petmily.backend.api.walker.dto.walkerBooking;

import lombok.Data;

@Data
public class LocationUpdateRequest {
    private Double latitude;
    private Double longitude;
    
    // Helper method to format location
    public String getFormattedLocation() {
        if (latitude != null && longitude != null) {
            return latitude + "," + longitude;
        }
        return null;
    }
}