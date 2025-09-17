package com.petmily.backend.api.walker.dto;

import lombok.Data;

@Data
public class WalkerSearchRequest {
    private String serviceArea;
    private String experienceLevel;
    private Double minRating;
    private Double userLatitude;
    private Double userLongitude;
}
