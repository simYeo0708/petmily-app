package com.petmily.backend.api.walk.dto.booking.request;

import lombok.Getter;

@Getter
public class WalkApplicationRequest {
    private Long openRequestId; // 오픈 요청 ID
    private String message;     // 워커가 보내는 메시지
    private Double proposedPrice; // 제안 가격 (선택사항)
}