package com.petmily.backend.api.walk.dto.tracking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyCallRequest {
    private EmergencyType emergencyType;
    private String location;
    private String description;
    private Double latitude;
    private Double longitude;

    public enum EmergencyType {
        POLICE_112("112"),
        FIRE_119("119"),
        EMERGENCY_CONTACT("비상연락망");

        private final String displayName;

        EmergencyType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}