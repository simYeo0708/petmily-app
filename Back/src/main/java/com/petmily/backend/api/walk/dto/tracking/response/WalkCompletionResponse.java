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
public class WalkCompletionResponse {
    private WalkBookingResponse booking;
    private WalkDetailResponse walkDetail;
    private WalkPathResponse.WalkStatistics statistics;

    public static WalkCompletionResponse of(WalkBookingResponse booking,
                                            WalkDetailResponse walkDetail,
                                            WalkPathResponse.WalkStatistics statistics) {
        return WalkCompletionResponse.builder()
                .booking(booking)
                .walkDetail(walkDetail)
                .statistics(statistics)
                .build();
    }
}
