package com.petmily.backend.api.walker.dto.walkerBooking;

import com.petmily.backend.domain.walker.entity.BookingChangeRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeRequestDecisionRequest {
    private BookingChangeRequest.ChangeRequestStatus decision;
    private String response;
}