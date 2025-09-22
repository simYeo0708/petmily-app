package com.petmily.backend.api.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReturnProcessRequest {
    
    @NotBlank(message = "처리 메모는 필수입니다")
    private String memo;
    
    private String trackingNumber;
    private String refundMethod;
}