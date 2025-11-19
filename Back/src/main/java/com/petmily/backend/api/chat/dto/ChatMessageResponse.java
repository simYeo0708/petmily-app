package com.petmily.backend.api.chat.dto;

import com.petmily.backend.domain.chat.entity.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    private Long id;
    private Long chatRoomId;
    private String roomId;  // UUID roomId 추가
    private Long senderId;
    private ChatMessage.MessageType messageType;
    private String content;
    private Boolean isSystemMessage;
    private String bookingButtonData;
    private Boolean isRead;
    private LocalDateTime createdAt;

    // 발신자 정보
    private String senderName;
    private String senderProfileImageUrl;

    public static ChatMessageResponse from(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .chatRoomId(message.getChatRoomId())
                .senderId(message.getSenderId())
                .messageType(message.getMessageType())
                .content(message.getContent())
                .isSystemMessage(message.getIsSystemMessage())
                .bookingButtonData(message.getBookingButtonData())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .senderName(message.getSender() != null ? message.getSender().getName() : null)
                .senderProfileImageUrl(null) // User 엔티티에 profileImageUrl이 없으므로 null로 설정
                .build();
    }
}