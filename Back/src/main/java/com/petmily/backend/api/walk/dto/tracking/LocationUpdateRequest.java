package com.petmily.backend.api.walk.dto.tracking;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateRequest {
    private Double latitude;
    private Double longitude;
    private String address;

    // Helper method to format location
    public String getFormattedLocation() {
        if (address != null && !address.trim().isEmpty()) {
            if (latitude != null && longitude != null) {
                return address + " (" + latitude + ", " + longitude + ")";
            }
            return address;
        }
        if (latitude != null && longitude != null) {
            return latitude + "," + longitude;
        }
        return null;
    }
}