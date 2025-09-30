package com.petmily.backend.api.walk.dto.tracking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalkEndRequest {
    private String specialNotes;
    private String walkingSummary;
    private String petCondition;
    private String incidentReport;
}