package com.petmily.backend.api.walker.dto.walking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalkTerminationRequest {
    private String reason;
    private String requestedBy; // WALKER or USER
}