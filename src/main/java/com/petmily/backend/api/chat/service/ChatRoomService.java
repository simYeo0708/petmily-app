package com.petmily.backend.api.chat.service;

import com.petmily.backend.api.chat.dto.ChatRoomResponse;
import com.petmily.backend.api.chat.dto.CreateChatRoomRequest;
import com.petmily.backend.api.chat.redis.RedisSubscriber;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.chat.entity.ChatRoom;
import com.petmily.backend.domain.chat.repository.ChatRoomRepository;
import com.petmily.backend.domain.chat.repository.ChatMessageRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walker.repository.WalkerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
@Service
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final WalkerProfileRepository walkerProfileRepository;
    private final RedisSubscriber redisSubscriber;
    private final RedisMessageListenerContainer redisMessageListenerContainer;

    private final Map<String, ChannelTopic> topics = new HashMap<>();

    // 사용자의 모든 채팅방 조회
    public List<ChatRoomResponse> getUserChatRooms(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<ChatRoom> chatRooms = chatRoomRepository.findByUserIdOrWalkerUserId(user.getId());
        
        return chatRooms.stream()
                .map(chatRoom -> {
                    // 마지막 메시지와 안읽은 메시지 개수 조회
                    var lastMessage = chatMessageRepository.findLastMessageByChatRoomId(chatRoom.getId());
                    Long unreadCount = chatMessageRepository.countUnreadMessages(chatRoom.getId(), user.getId());
                    
                    return ChatRoomResponse.fromWithLastMessage(
                            chatRoom,
                            lastMessage != null ? lastMessage.getContent() : null,
                            lastMessage != null ? lastMessage.getCreateTime() : null,
                            unreadCount
                    );
                })
                .collect(Collectors.toList());
    }

    // 채팅방 ID로 조회
    public ChatRoomResponse findRoomById(String roomId) {
        ChatRoom chatRoom = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "채팅방을 찾을 수 없습니다"));
        return ChatRoomResponse.from(chatRoom);
    }

    // 예약 전 문의용 채팅방 생성 (유저 -> 워커)
    @Transactional
    public ChatRoomResponse createPreBookingChatRoom(String username, CreateChatRoomRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerProfile walker = walkerProfileRepository.findById(request.getWalkerId())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "워커를 찾을 수 없습니다"));

        // 워커는 자기 자신과 채팅할 수 없음
        if (walker.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "자기 자신과는 채팅할 수 없습니다");
        }

        // 기존 예약 전 문의 채팅방이 있는지 확인
        return chatRoomRepository.findByUserIdAndWalkerIdForPreBooking(user.getId(), walker.getId())
                .map(ChatRoomResponse::from)
                .orElseGet(() -> {
                    // 새 채팅방 생성
                    ChatRoom newChatRoom = ChatRoom.builder()
                            .roomId(UUID.randomUUID().toString())
                            .userId(user.getId())
                            .walkerId(walker.getId())
                            .chatType(ChatRoom.ChatType.PRE_BOOKING)
                            .isActive(true)
                            .build();
                    
                    ChatRoom savedRoom = chatRoomRepository.save(newChatRoom);
                    return ChatRoomResponse.from(savedRoom);
                });
    }

    // 예약 확정 시 자동 채팅방 생성
    @Transactional
    public ChatRoomResponse createPostBookingChatRoom(Long userId, Long walkerId, Long bookingId) {
        // 해당 예약에 대한 채팅방이 이미 있는지 확인
        return chatRoomRepository.findByBookingIdAndIsActiveTrue(bookingId)
                .map(ChatRoomResponse::from)
                .orElseGet(() -> {
                    ChatRoom newChatRoom = ChatRoom.builder()
                            .roomId(UUID.randomUUID().toString())
                            .userId(userId)
                            .walkerId(walkerId)
                            .bookingId(bookingId)
                            .chatType(ChatRoom.ChatType.POST_BOOKING)
                            .isActive(true)
                            .build();
                    
                    ChatRoom savedRoom = chatRoomRepository.save(newChatRoom);
                    return ChatRoomResponse.from(savedRoom);
                });
    }

    // 사용자가 채팅방에 접근 권한이 있는지 확인
    public boolean hasAccessToChatRoom(String roomId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        ChatRoom chatRoom = chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "채팅방을 찾을 수 없습니다"));

        // 채팅방의 유저이거나, 워커인 경우
        if (chatRoom.getUserId().equals(user.getId())) {
            return true;
        }
        
        // 워커인지 확인
        WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId()).orElse(null);
        return walker != null && chatRoom.getWalkerId().equals(walker.getId());
    }

    // Redis 채널 관리
    public ChannelTopic getTopic(String roomId) {
        return topics.get(roomId);
    }

    public void enterChatRoom(String roomId) {
        ChannelTopic topic = topics.get(roomId);
        if (topic == null) {
            topic = new ChannelTopic(roomId);
            redisMessageListenerContainer.addMessageListener(redisSubscriber, topic);
            topics.put(roomId, topic);
        }
    }
}
