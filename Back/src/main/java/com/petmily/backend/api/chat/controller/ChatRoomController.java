package com.petmily.backend.api.chat.controller;

import com.petmily.backend.api.chat.dto.ChatRoomResponse;
import com.petmily.backend.api.chat.dto.CreateChatRoomRequest;
import com.petmily.backend.api.chat.service.ChatRoomService;
import com.petmily.backend.api.common.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/chat-rooms")
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    /**
     * 사용자의 채팅방 목록 조회
     */
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomResponse>> getUserChatRooms(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        List<ChatRoomResponse> chatRooms = chatRoomService.getUserChatRooms(userId);
        return ResponseEntity.ok(chatRooms);
    }

    /**
     * 채팅방 상세 정보 조회
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ChatRoomResponse> getChatRoom(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        
        // 접근 권한 확인
        if (!chatRoomService.hasAccessToChatRoom(roomId, userId)) {
            return ResponseEntity.status(403).build();
        }
        
        ChatRoomResponse chatRoom = chatRoomService.findRoomById(roomId);
        return ResponseEntity.ok(chatRoom);
    }

    /**
     * 예약 전 문의용 채팅방 생성 (유저 -> 워커)
     */
    @PostMapping("/room/inquiry")
    public ResponseEntity<ChatRoomResponse> createInquiryChatRoom(
            @RequestBody CreateChatRoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        ChatRoomResponse chatRoom = chatRoomService.createPreBookingChatRoom(userId, request);
        return ResponseEntity.ok(chatRoom);
    }
}
