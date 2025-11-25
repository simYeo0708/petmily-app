package com.petmily.backend.domain.chat.entity;

import com.petmily.backend.domain.common.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "chat_messages")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ChatMessage extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "chat_room_id", nullable = false)
    private Long chatRoomId;
    
    @Column(name = "sender_id", nullable = false)
    private Long senderId;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    private MessageType messageType = MessageType.TEXT;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Builder.Default
    @Column(name = "is_system_message")
    private Boolean isSystemMessage = false;
    
    @Column(name = "booking_button_data")
    private String bookingButtonData; // JSON format for booking details button
    
    @Builder.Default
    @Column(name = "is_read")
    private Boolean isRead = false;
    
    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", insertable = false, updatable = false)
    private ChatRoom chatRoom;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", insertable = false, updatable = false)
    private User sender;
    
    public enum MessageType {
        TEXT,           // 일반 텍스트 메시지
        SYSTEM,         // 시스템 메시지
        BOOKING_CARD,   // 예약 상세 카드
        JOIN,           // 입장 메시지
        LEAVE           // 퇴장 메시지
    }
}