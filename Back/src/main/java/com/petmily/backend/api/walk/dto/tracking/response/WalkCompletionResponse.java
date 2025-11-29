package com.petmily.backend.api.walk.dto.tracking.response;

import com.petmily.backend.api.walk.dto.booking.response.WalkerBookingResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalkCompletionResponse {
    private WalkerBookingResponse booking;
    private WalkDetailResponse walkDetail;
    private WalkPathResponse.WalkStatistics statistics;

    public static WalkCompletionResponse of(WalkerBookingResponse booking,
                                            WalkDetailResponse walkDetail,
                                            WalkPathResponse.WalkStatistics statistics) {
        return WalkCompletionResponse.builder()
                .booking(booking)
                .walkDetail(walkDetail)
                .statistics(statistics)
                .build();
    }
}
