package com.petmily.backend.api.walker.dto.walkerProfile;

import lombok.Data;

@Data
public class WalkerProfileCreateRequest {
    private String detailDescription; // 상세 설명 (bio + experience 통합)
    private String serviceArea; // e.g., "Gangnam-gu"
    // Add other fields necessary for initial walker registration
}
