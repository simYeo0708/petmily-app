package com.petmily.backend.api.walk.dto.tracking.response;

import com.petmily.backend.api.walk.dto.booking.response.WalkBookingResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalkSessionResponse {
    private WalkBookingResponse booking;
    private WalkDetailResponse walkDetail;

    public static WalkSessionResponse of(WalkBookingResponse booking, WalkDetailResponse walkDetail) {
        return WalkSessionResponse.builder()
                .booking(booking)
                .walkDetail(walkDetail)
                .build();
    }
}
