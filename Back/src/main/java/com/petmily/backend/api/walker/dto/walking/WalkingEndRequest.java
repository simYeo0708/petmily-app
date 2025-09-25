package com.petmily.backend.api.walker.dto.walking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalkingEndRequest {
    private String specialNotes;
    private String walkingSummary;
    private String petCondition;
    private String incidentReport;
}