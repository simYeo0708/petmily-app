package com.petmily.backend.domain.chat.repository;

import com.petmily.backend.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    Optional<ChatRoom> findByRoomId(String roomId);
    
    // 특정 유저의 채팅방 목록 조회 (유저 또는 워커로서 참여한 방)
    @Query("SELECT c FROM ChatRoom c WHERE (c.userId = :userId OR " +
           "(SELECT w.userId FROM WalkerProfile w WHERE w.id = c.walkerId) = :userId) " +
           "AND c.isActive = true ORDER BY c.modifyTime DESC")
    List<ChatRoom> findByUserIdOrWalkerUserId(@Param("userId") Long userId);
    
    // 유저와 워커 간의 기존 채팅방 조회 (예약 전 문의용)
    @Query("SELECT c FROM ChatRoom c WHERE c.userId = :userId AND c.walkerId = :walkerId " +
           "AND c.chatType = 'PRE_BOOKING' AND c.isActive = true")
    Optional<ChatRoom> findByUserIdAndWalkerIdForPreBooking(@Param("userId") Long userId, @Param("walkerId") Long walkerId);
    
    // 특정 예약에 대한 채팅방 조회
    Optional<ChatRoom> findByBookingIdAndIsActiveTrue(Long bookingId);
    
    // 유저와 워커 간의 모든 채팅방 조회
    @Query("SELECT c FROM ChatRoom c WHERE c.userId = :userId AND c.walkerId = :walkerId " +
           "AND c.isActive = true ORDER BY c.modifyTime DESC")
    List<ChatRoom> findByUserIdAndWalkerId(@Param("userId") Long userId, @Param("walkerId") Long walkerId);
}