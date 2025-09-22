package com.petmily.backend.api.chat.controller;

import com.petmily.backend.api.chat.dto.ChatRoomResponse;
import com.petmily.backend.api.chat.dto.CreateChatRoomRequest;
import com.petmily.backend.api.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity<List<ChatRoomResponse>> getUserChatRooms(Authentication authentication) {
        String username = authentication.getName();
        List<ChatRoomResponse> chatRooms = chatRoomService.getUserChatRooms(username);
        return ResponseEntity.ok(chatRooms);
    }

    /**
     * 채팅방 상세 정보 조회
     */
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ChatRoomResponse> getChatRoom(@PathVariable String roomId, Authentication authentication) {
        String username = authentication.getName();
        
        // 접근 권한 확인
        if (!chatRoomService.hasAccessToChatRoom(roomId, username)) {
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
            Authentication authentication) {
        String username = authentication.getName();
        ChatRoomResponse chatRoom = chatRoomService.createPreBookingChatRoom(username, request);
        return ResponseEntity.ok(chatRoom);
    }
}
