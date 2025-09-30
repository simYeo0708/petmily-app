package com.petmily.backend.api.walker.dto.walkerProfile;

import lombok.Data;

@Data
public class WalkerProfileUpdateRequest {
    private String detailDescription; // 상세 설명 (bio + experience 통합)
    private String availableTime;
    private String serviceArea;
    // Add other fields that a walker can update in their profile
}
