package com.petmily.backend.domain.chat.repository;

import com.petmily.backend.domain.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // 채팅방의 메시지 목록 조회 (페이징)
    Page<ChatMessage> findByChatRoomIdOrderByCreateTimeDesc(Long chatRoomId, Pageable pageable);
    
    // 채팅방의 메시지 목록 조회 (최신 순)
    List<ChatMessage> findByChatRoomIdOrderByCreateTimeAsc(Long chatRoomId);
    
    // 안읽은 메시지 개수
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.chatRoomId = :chatRoomId " +
           "AND m.senderId != :userId AND m.isRead = false")
    Long countUnreadMessages(@Param("chatRoomId") Long chatRoomId, @Param("userId") Long userId);
    
    // 메시지를 읽음 처리
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.chatRoomId = :chatRoomId " +
           "AND m.senderId != :userId AND m.isRead = false")
    void markMessagesAsRead(@Param("chatRoomId") Long chatRoomId, @Param("userId") Long userId);
    
    // 채팅방의 마지막 메시지 조회
    @Query("SELECT m FROM ChatMessage m WHERE m.chatRoomId = :chatRoomId " +
           "ORDER BY m.createTime DESC LIMIT 1")
    ChatMessage findLastMessageByChatRoomId(@Param("chatRoomId") Long chatRoomId);
}