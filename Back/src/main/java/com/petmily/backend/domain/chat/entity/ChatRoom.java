package com.petmily.backend.domain.chat.entity;

import com.petmily.backend.domain.common.entity.BaseTimeEntity;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walker.entity.Walker;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "chat_rooms")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ChatRoom extends BaseTimeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "room_id", unique = true, nullable = false)
    private String roomId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "walker_id", nullable = false)
    private Long walkerId;
    
    @Column(name = "booking_id")
    private Long bookingId; // 예약 기반 채팅방인 경우 (nullable)
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "chat_type")
    private ChatType chatType = ChatType.PRE_BOOKING;
    
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    // Relations
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "walker_id", insertable = false, updatable = false)
    private Walker walker;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", insertable = false, updatable = false)
    private WalkBooking booking;
    
    public enum ChatType {
        PRE_BOOKING,    // 예약 전 문의
        POST_BOOKING    // 예약 후 자동 생성
    }
    
    public String getRoomName() {
        String userName = user != null ? user.getName() : "User";
        String walkerName = walker != null && walker.getUser() != null ? walker.getUser().getName() : "Walker";
        
        if (chatType == ChatType.POST_BOOKING) {
            return userName + " ↔ " + walkerName + " (예약 #" + bookingId + ")";
        } else {
            return userName + " ↔ " + walkerName + " (문의)";
        }
    }
}