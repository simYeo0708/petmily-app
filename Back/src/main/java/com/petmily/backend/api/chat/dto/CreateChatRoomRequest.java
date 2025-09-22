package com.petmily.backend.api.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateChatRoomRequest {
    
    private Long walkerId;
    private String initialMessage; // 첫 메시지 (선택사항)
}