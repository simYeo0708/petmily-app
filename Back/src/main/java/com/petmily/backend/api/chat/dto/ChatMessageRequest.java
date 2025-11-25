package com.petmily.backend.api.chat.dto;

import com.petmily.backend.domain.chat.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    
    private String roomId;
    @Builder.Default
    private ChatMessage.MessageType messageType = ChatMessage.MessageType.TEXT;
    private String content;
    
    // WebSocket을 위한 추가 필드
    private String action; // SEND, JOIN, LEAVE 등
}