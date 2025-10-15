package com.petmily.backend.api.map.dto;

import lombok.Data;

@Data
public class LocationResponse {
    private Double latitude;
    private Double longitude;
    private Long timestamp;
    private String userId;
    private String petProfileImage;
    private String petName;
    private String petSpecies;
}

