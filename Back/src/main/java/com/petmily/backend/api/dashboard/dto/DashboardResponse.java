package com.petmily.backend.api.dashboard.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import com.petmily.backend.api.pet.dto.PetSummaryResponse;
import com.petmily.backend.api.walker.dto.walkerBooking.WalkerBookingResponse;
import com.petmily.backend.api.walker.dto.WalkerSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(builder = DashboardResponse.DashboardResponseBuilder.class)
public class DashboardResponse {
    
    @JsonPOJOBuilder(withPrefix = "")
    public static class DashboardResponseBuilder {
    }
    // User's pets
    private List<PetSummaryResponse> myPets;
    
    // Active bookings
    private List<WalkerBookingResponse> activeBookings;
    
    // Nearby walkers
    private List<WalkerSummaryResponse> nearbyWalkers;
    
    // Quick stats
    private QuickStats stats;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonDeserialize(builder = QuickStats.QuickStatsBuilder.class)
    public static class QuickStats {
        private int totalPets;
        private int upcomingBookings;
        private int completedWalks;
        private Double totalSpent;
    }
}