package com.petmily.backend.api.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmily.backend.api.chat.dto.ChatMessageRequest;
import com.petmily.backend.api.chat.dto.ChatMessageResponse;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.chat.entity.ChatMessage;
import com.petmily.backend.domain.chat.entity.ChatRoom;
import com.petmily.backend.domain.chat.repository.ChatMessageRepository;
import com.petmily.backend.domain.chat.repository.ChatRoomRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private ChatRoom findChatRoomById(String roomId){
        return chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "채팅방을 찾을 수 없습니다"));
    }

    private User findUserById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    // 채팅방의 메시지 목록 조회 (페이징)
    public Page<ChatMessageResponse> getChatMessages(String roomId, Long userId, Pageable pageable) {
        ChatRoom chatRoom = findChatRoomById(roomId);
        User user = findUserById(userId);

        // 접근 권한 확인
        if (!hasAccessToChatRoom(chatRoom, user)) {
            throw new CustomException(ErrorCode.NO_ACCESS, "채팅방에 접근할 권한이 없습니다");
        }

        Page<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderByCreatedAtDesc(chatRoom.getId(), pageable);
        return messages.map(ChatMessageResponse::from);
    }

    // 메시지 전송
    @Transactional
    public ChatMessageResponse sendMessage(String roomId, Long userId, ChatMessageRequest request) {
        ChatRoom chatRoom = findChatRoomById(roomId);
        User user = findUserById(userId);

        // 접근 권한 확인
        if (!hasAccessToChatRoom(chatRoom, user)) {
            throw new CustomException(ErrorCode.NO_ACCESS, "채팅방에 접근할 권한이 없습니다");
        }

        ChatMessage message = ChatMessage.builder()
                .chatRoomId(chatRoom.getId())
                .senderId(user.getId())
                .messageType(request.getMessageType())
                .content(request.getContent())
                .isSystemMessage(false)
                .isRead(false)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);
        return ChatMessageResponse.from(savedMessage);
    }

    // 예약 상세 정보가 포함된 시스템 메시지 생성
    @Transactional
    public ChatMessageResponse createBookingSystemMessage(Long chatRoomId, WalkBooking booking) {
        try {
            // 예약 정보를 JSON으로 변환
            Map<String, Object> bookingData = new HashMap<>();
            bookingData.put("bookingId", booking.getId());
            bookingData.put("date", booking.getDate().toString());
            bookingData.put("duration", booking.getDuration());
            bookingData.put("totalPrice", booking.getTotalPrice());
            bookingData.put("pickupLocation", booking.getPickupAddress());
            bookingData.put("dropoffLocation", booking.getDropoffAddress());

            String bookingButtonData = objectMapper.writeValueAsString(bookingData);

            ChatMessage systemMessage = ChatMessage.builder()
                    .chatRoomId(chatRoomId)
                    .senderId(0L) // 시스템 메시지
                    .messageType(ChatMessage.MessageType.BOOKING_CARD)
                    .content("🐾 예약이 확정되었습니다! 아래 버튼을 눌러 상세 정보를 확인하세요.")
                    .isSystemMessage(true)
                    .bookingButtonData(bookingButtonData)
                    .isRead(false)
                    .build();

            ChatMessage savedMessage = chatMessageRepository.save(systemMessage);
            return ChatMessageResponse.from(savedMessage);

        } catch (Exception e) {
            log.error("예약 시스템 메시지 생성 중 오류 발생", e);
            throw new CustomException(ErrorCode.INTERNAL_ERROR, "시스템 메시지 생성에 실패했습니다");
        }
    }

    // 입장 시스템 메시지 생성
    @Transactional
    public ChatMessageResponse createJoinMessage(Long chatRoomId, Long userId) {
        User user = findUserById(userId);
        ChatMessage joinMessage = ChatMessage.builder()
                .chatRoomId(chatRoomId)
                .senderId(0L) // 시스템 메시지
                .messageType(ChatMessage.MessageType.SYSTEM)
                .content(user.getUsername() + "님이 채팅방에 입장했습니다.")
                .isSystemMessage(true)
                .isRead(false)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(joinMessage);
        return ChatMessageResponse.from(savedMessage);
    }

    // 메시지를 읽음 처리
    @Transactional
    public void markMessagesAsRead(String roomId, Long userId) {
        ChatRoom chatRoom = findChatRoomById(roomId);
        User user = findUserById(userId);

        chatMessageRepository.markMessagesAsRead(chatRoom.getId(), user.getId());
    }

    // 접근 권한 확인
    private boolean hasAccessToChatRoom(ChatRoom chatRoom, User user) {
        // 채팅방의 유저이거나, 워커인 경우
        if (chatRoom.getUserId().equals(user.getId())) {
            return true;
        }

        // 워커인지 확인 (walker 테이블에서 user_id로 조회)
        return chatRoom.getWalker() != null &&
                chatRoom.getWalker().getUserId().equals(user.getId());
    }
}