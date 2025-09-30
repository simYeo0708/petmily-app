package com.petmily.backend.api.walker.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(builder = WalkerSummaryResponse.WalkerSummaryResponseBuilder.class)
public class WalkerSummaryResponse {
    private Long id;
    private String username;
    private String name;
    private String profileImageUrl;
    private String location;
    private Double rating;
    private Integer walksCount;
    private Double pricePerHour;
    private WalkerStatus status;
    
    public static WalkerSummaryResponse from(WalkerProfile walker) {
        return WalkerSummaryResponse.builder()
                .id(walker.getId())
                .username(walker.getUser() != null ? walker.getUser().getUsername() : null)
                .name(walker.getUser() != null ? walker.getUser().getName() : null)
                .profileImageUrl(walker.getProfileImageUrl())
                .location(walker.getCoordinates())
                .rating(walker.getRating())
                .walksCount(walker.getWalksCount())
                .pricePerHour(walker.getHourlyRate() != null ? walker.getHourlyRate().doubleValue() : null)
                .status(walker.getStatus())
                .build();
    }
}