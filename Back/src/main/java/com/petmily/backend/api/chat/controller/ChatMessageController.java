package com.petmily.backend.api.chat.controller;

import com.petmily.backend.api.chat.dto.ChatMessageRequest;
import com.petmily.backend.api.chat.dto.ChatMessageResponse;
import com.petmily.backend.api.chat.service.ChatMessageService;
import com.petmily.backend.api.common.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/chat-rooms")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    /**
     * 채팅방의 메시지 목록 조회 (페이징)
     */
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<Page<ChatMessageResponse>> getChatMessages(
            @PathVariable String roomId,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        Page<ChatMessageResponse> messages = chatMessageService.getChatMessages(roomId, userId, pageable);
        return ResponseEntity.ok(messages);
    }

    /**
     * 메시지 전송 (REST API)
     */
    @PostMapping("/{roomId}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable String roomId,
            @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        request.setRoomId(roomId); // roomId 설정
        ChatMessageResponse response = chatMessageService.sendMessage(roomId, userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 메시지 읽음 처리
     */
    @PutMapping("/{roomId}/messages/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable String roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        chatMessageService.markMessagesAsRead(roomId, userId);
        return ResponseEntity.ok().build();
    }
}