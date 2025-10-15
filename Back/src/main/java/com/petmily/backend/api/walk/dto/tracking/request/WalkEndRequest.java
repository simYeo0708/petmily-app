package com.petmily.backend.api.walk.dto.tracking.request;

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
    private String walkSummary;
    private String petCondition;
    private String incidentReport;
}