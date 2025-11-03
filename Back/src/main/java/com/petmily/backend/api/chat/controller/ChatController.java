package com.petmily.backend.api.chat.controller;

import com.petmily.backend.api.chat.dto.ChatMessageRequest;
import com.petmily.backend.api.chat.dto.ChatMessageResponse;
import com.petmily.backend.api.chat.redis.RedisPublisher;
import com.petmily.backend.api.chat.service.ChatMessageService;
import com.petmily.backend.api.chat.service.ChatRoomService;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.chat.entity.ChatMessage;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@RequiredArgsConstructor
@Controller
@Slf4j
public class ChatController {

    private final RedisPublisher redisPublisher;
    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;
    private final UserRepository userRepository;

    /**
     * WebSocket을 통한 메시지 전송
     * /pub/chat/message/{roomId} 로 메시지 전송
     */
    @MessageMapping("/chat/message/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, 
                           @Payload ChatMessageRequest request,
                           SimpMessageHeaderAccessor headerAccessor) {
        try {
            // 세션에서 사용자 정보 추출
            String username = (String) headerAccessor.getSessionAttributes().get("username");
            if (username == null) {
                log.warn("WebSocket 메시지 전송 시도 - 사용자 인증 정보 없음");
                return;
            }

            // username으로 userId 조회
            Long userId = getUserIdFromUsername(username);

            // 접근 권한 확인
            if (!chatRoomService.hasAccessToChatRoom(roomId, userId)) {
                log.warn("채팅방 접근 권한 없음 - 사용자: {}, 방: {}", username, roomId);
                return;
            }

            if (isJoin(request)) {
                // 채팅방 입장 처리
                chatRoomService.enterChatRoom(roomId);
                ChatMessageResponse joinMessage = chatMessageService.createJoinMessage(
                    getChatRoomIdFromRoomId(roomId), userId);

                // Redis로 입장 메시지 브로드캐스트
                redisPublisher.publish(chatRoomService.getTopic(roomId), joinMessage);
            } else {
                // 일반 메시지 전송
                request.setRoomId(roomId);
                ChatMessageResponse response = chatMessageService.sendMessage(roomId, userId, request);

                // Redis로 메시지 브로드캐스트
                redisPublisher.publish(chatRoomService.getTopic(roomId), response);
            }

        } catch (Exception e) {
            log.error("WebSocket 메시지 처리 중 오류 발생", e);
        }
    }

    private boolean isJoin(ChatMessageRequest request) {
        return "JOIN".equals(request.getAction()) ||
               ChatMessage.MessageType.JOIN.equals(request.getMessageType());
    }

    private Long getChatRoomIdFromRoomId(String roomId) {
        return chatRoomService.findRoomById(roomId).getId();
    }

    private Long getUserIdFromUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return user.getId();
    }
}
