package com.petmily.backend.api.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminReplyRequest {
    
    @NotBlank(message = "관리자 답변은 필수입니다")
    @Size(max = 500, message = "관리자 답변은 500자 이하여야 합니다")
    private String adminReply;
}