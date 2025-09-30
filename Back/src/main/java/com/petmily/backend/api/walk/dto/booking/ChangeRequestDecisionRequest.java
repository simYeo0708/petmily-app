package com.petmily.backend.api.walk.dto.booking;

import com.petmily.backend.domain.walk.entity.BookingChangeRequest;
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