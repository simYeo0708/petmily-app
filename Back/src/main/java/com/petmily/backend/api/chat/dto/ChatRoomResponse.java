package com.petmily.backend.api.chat.dto;

import com.petmily.backend.domain.chat.entity.ChatRoom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomResponse {
    
    private Long id;
    private String roomId;
    private Long userId;
    private Long walkerId;
    private Long bookingId;
    private ChatRoom.ChatType chatType;
    private String roomName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 채팅방 참여자 정보
    private String userName;
    private String walkerName;
    private String walkerProfileImageUrl;

    // 마지막 메시지 정보
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Long unreadCount;

    public static ChatRoomResponse from(ChatRoom chatRoom) {
        return ChatRoomResponse.builder()
                .id(chatRoom.getId())
                .roomId(chatRoom.getRoomId())
                .userId(chatRoom.getUserId())
                .walkerId(chatRoom.getWalkerId())
                .bookingId(chatRoom.getBookingId())
                .chatType(chatRoom.getChatType())
                .roomName(chatRoom.getRoomName())
                .isActive(chatRoom.getIsActive())
                .createdAt(chatRoom.getCreatedAt())
                .updatedAt(chatRoom.getUpdatedAt())
                .userName(chatRoom.getUser() != null ? chatRoom.getUser().getName() : null)
                .walkerName(chatRoom.getWalker() != null && chatRoom.getWalker().getUser() != null ?
                           chatRoom.getWalker().getUser().getName() : null)
                .walkerProfileImageUrl(chatRoom.getWalker() != null ? chatRoom.getWalker().getProfileImageUrl() : null)
                .build();
    }
    
    public static ChatRoomResponse fromWithLastMessage(ChatRoom chatRoom, String lastMessage, 
                                                      LocalDateTime lastMessageTime, Long unreadCount) {
        ChatRoomResponse response = from(chatRoom);
        response.setLastMessage(lastMessage);
        response.setLastMessageTime(lastMessageTime);
        response.setUnreadCount(unreadCount);
        return response;
    }
}