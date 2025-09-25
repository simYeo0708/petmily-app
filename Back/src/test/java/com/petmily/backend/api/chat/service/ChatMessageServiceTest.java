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
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatMessageServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ChatMessageService chatMessageService;

    private User user;
    private User walkerUser;
    private WalkerProfile walker;
    private ChatRoom chatRoom;
    private ChatMessage chatMessage;
    private ChatMessageRequest messageRequest;
    private WalkerBooking booking;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .name("Test User")
                .build();

        walkerUser = User.builder()
                .id(2L)
                .username("walker")
                .email("walker@example.com")
                .name("Walker User")
                .build();

        walker = WalkerProfile.builder()
                .id(1L)
                .userId(2L)
                .bio("Test Walker Bio")
                .hourlyRate(25.0)
                .build();

        chatRoom = ChatRoom.builder()
                .id(1L)
                .roomId("test-room-id")
                .userId(1L)
                .walkerId(1L)
                .chatType(ChatRoom.ChatType.PRE_BOOKING)
                .isActive(true)
                .walker(walker)
                .build();

        chatMessage = ChatMessage.builder()
                .id(1L)
                .chatRoomId(1L)
                .senderId(1L)
                .messageType(ChatMessage.MessageType.TEXT)
                .content("Hello, this is a test message")
                .isSystemMessage(false)
                .isRead(false)
                .build();

        messageRequest = ChatMessageRequest.builder()
                .messageType(ChatMessage.MessageType.TEXT)
                .content("Test message content")
                .build();

        booking = WalkerBooking.builder()
                .id(1L)
                .userId(1L)
                .walkerId(1L)
                .duration(60)
                .totalPrice(50000.0)
                .pickupAddress("Seoul Station")
                .dropoffAddress("Gangnam Station")
                .build();

        pageable = PageRequest.of(0, 10);
    }

    @Test
    @DisplayName("채팅 메시지 목록 조회 성공")
    void getChatMessages_Success() {
        // Given
        String roomId = "test-room-id";
        String username = "testuser";
        List<ChatMessage> messages = Arrays.asList(chatMessage);
        Page<ChatMessage> messagePage = new PageImpl<>(messages, pageable, 1);

        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.of(chatRoom));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(chatMessageRepository.findByChatRoomIdOrderByCreateTimeDesc(1L, pageable))
                .thenReturn(messagePage);

        // When
        Page<ChatMessageResponse> result = chatMessageService.getChatMessages(roomId, username, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getContent()).isEqualTo("Hello, this is a test message");

        verify(chatRoomRepository).findByRoomId(roomId);
        verify(userRepository).findByUsername(username);
        verify(chatMessageRepository).findByChatRoomIdOrderByCreateTimeDesc(1L, pageable);
    }

    @Test
    @DisplayName("채팅 메시지 목록 조회 실패 - 채팅방 없음")
    void getChatMessages_ChatRoomNotFound() {
        // Given
        String roomId = "non-existent-room";
        String username = "testuser";

        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatMessageService.getChatMessages(roomId, username, pageable))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND)
                .hasMessageContaining("채팅방을 찾을 수 없습니다");

        verify(chatRoomRepository).findByRoomId(roomId);
        verify(userRepository, never()).findByUsername(any());
    }

    @Test
    @DisplayName("채팅 메시지 목록 조회 실패 - 사용자 없음")
    void getChatMessages_UserNotFound() {
        // Given
        String roomId = "test-room-id";
        String username = "non-existent-user";

        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.of(chatRoom));
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatMessageService.getChatMessages(roomId, username, pageable))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);

        verify(chatRoomRepository).findByRoomId(roomId);
        verify(userRepository).findByUsername(username);
    }

    @Test
    @DisplayName("채팅 메시지 목록 조회 실패 - 접근 권한 없음")
    void getChatMessages_NoAccess() {
        // Given
        String roomId = "test-room-id";
        String username = "unauthorized-user";
        User unauthorizedUser = User.builder()
                .id(99L)
                .username("unauthorized-user")
                .build();

        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.of(chatRoom));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(unauthorizedUser));

        // When & Then
        assertThatThrownBy(() -> chatMessageService.getChatMessages(roomId, username, pageable))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NO_ACCESS)
                .hasMessageContaining("채팅방에 접근할 권한이 없습니다");

        verify(chatRoomRepository).findByRoomId(roomId);
        verify(userRepository).findByUsername(username);
    }

    @Test
    @DisplayName("메시지 전송 성공")
    void sendMessage_Success() {
        // Given
        String roomId = "test-room-id";
        String username = "testuser";

        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.of(chatRoom));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(chatMessage);

        // When
        ChatMessageResponse result = chatMessageService.sendMessage(roomId, username, messageRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("Hello, this is a test message");

        verify(chatRoomRepository).findByRoomId(roomId);
        verify(userRepository).findByUsername(username);
        verify(chatMessageRepository).save(argThat(message ->
                message.getChatRoomId().equals(1L) &&
                message.getSenderId().equals(1L) &&
                message.getContent().equals("Test message content") &&
                !message.getIsSystemMessage() &&
                !message.getIsRead()
        ));
    }

    @Test
    @DisplayName("메시지 전송 실패 - 채팅방 없음")
    void sendMessage_ChatRoomNotFound() {
        // Given
        String roomId = "non-existent-room";
        String username = "testuser";

        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatMessageService.sendMessage(roomId, username, messageRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);

        verify(chatRoomRepository).findByRoomId(roomId);
        verify(chatMessageRepository, never()).save(any());
    }

    @Test
    @DisplayName("예약 시스템 메시지 생성 성공")
    void createBookingSystemMessage_Success() throws Exception {
        // Given
        Long chatRoomId = 1L;
        String expectedJson = "{\"bookingId\":1,\"date\":\"" + booking.getDate() +
                "\",\"duration\":60,\"totalPrice\":50000,\"pickupLocation\":\"Seoul Station\"," +
                "\"dropoffLocation\":\"Gangnam Station\"}";

        when(objectMapper.writeValueAsString(any())).thenReturn(expectedJson);
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(chatMessage);

        // When
        ChatMessageResponse result = chatMessageService.createBookingSystemMessage(chatRoomId, booking);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("Hello, this is a test message");

        verify(objectMapper).writeValueAsString(any());
        verify(chatMessageRepository).save(argThat(message ->
                message.getChatRoomId().equals(1L) &&
                message.getSenderId().equals(0L) &&
                message.getMessageType().equals(ChatMessage.MessageType.BOOKING_CARD) &&
                message.getIsSystemMessage() &&
                !message.getIsRead() &&
                message.getBookingButtonData().equals(expectedJson)
        ));
    }

    @Test
    @DisplayName("예약 시스템 메시지 생성 실패 - JSON 변환 오류")
    void createBookingSystemMessage_JsonError() throws Exception {
        // Given
        Long chatRoomId = 1L;
        when(objectMapper.writeValueAsString(any())).thenThrow(new RuntimeException("JSON error"));

        // When & Then
        assertThatThrownBy(() -> chatMessageService.createBookingSystemMessage(chatRoomId, booking))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INTERNAL_ERROR)
                .hasMessageContaining("시스템 메시지 생성에 실패했습니다");

        verify(objectMapper).writeValueAsString(any());
        verify(chatMessageRepository, never()).save(any());
    }

    @Test
    @DisplayName("입장 시스템 메시지 생성 성공")
    void createJoinMessage_Success() {
        // Given
        Long chatRoomId = 1L;
        String username = "testuser";

        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(chatMessage);

        // When
        ChatMessageResponse result = chatMessageService.createJoinMessage(chatRoomId, username);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEqualTo("Hello, this is a test message");

        verify(chatMessageRepository).save(argThat(message ->
                message.getChatRoomId().equals(1L) &&
                message.getSenderId().equals(0L) &&
                message.getMessageType().equals(ChatMessage.MessageType.SYSTEM) &&
                message.getContent().equals("testuser님이 채팅방에 입장했습니다.") &&
                message.getIsSystemMessage() &&
                !message.getIsRead()
        ));
    }

    @Test
    @DisplayName("메시지 읽음 처리 성공")
    void markMessagesAsRead_Success() {
        // Given
        String roomId = "test-room-id";
        String username = "testuser";

        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.of(chatRoom));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        // When
        chatMessageService.markMessagesAsRead(roomId, username);

        // Then
        verify(chatRoomRepository).findByRoomId(roomId);
        verify(userRepository).findByUsername(username);
        verify(chatMessageRepository).markMessagesAsRead(1L, 1L);
    }

    @Test
    @DisplayName("메시지 읽음 처리 실패 - 채팅방 없음")
    void markMessagesAsRead_ChatRoomNotFound() {
        // Given
        String roomId = "non-existent-room";
        String username = "testuser";

        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatMessageService.markMessagesAsRead(roomId, username))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND);

        verify(chatRoomRepository).findByRoomId(roomId);
        verify(chatMessageRepository, never()).markMessagesAsRead(any(), any());
    }

    @Test
    @DisplayName("워커 사용자의 채팅방 접근 권한 확인")
    void getChatMessages_WalkerAccess() {
        // Given
        String roomId = "test-room-id";
        String username = "walker";

        List<ChatMessage> messages = Arrays.asList(chatMessage);
        Page<ChatMessage> messagePage = new PageImpl<>(messages, pageable, 1);

        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.of(chatRoom));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(walkerUser));
        when(chatMessageRepository.findByChatRoomIdOrderByCreateTimeDesc(1L, pageable))
                .thenReturn(messagePage);

        // When
        Page<ChatMessageResponse> result = chatMessageService.getChatMessages(roomId, username, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);

        verify(chatRoomRepository).findByRoomId(roomId);
        verify(userRepository).findByUsername(username);
        verify(chatMessageRepository).findByChatRoomIdOrderByCreateTimeDesc(1L, pageable);
    }

    @Test
    @DisplayName("시스템 메시지 타입별 생성 확인")
    void sendMessage_DifferentMessageTypes() {
        // Given
        String roomId = "test-room-id";
        String username = "testuser";
        ChatMessageRequest imageRequest = ChatMessageRequest.builder()
                .messageType(ChatMessage.MessageType.SYSTEM)
                .content("http://example.com/image.jpg")
                .build();

        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.of(chatRoom));
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(chatMessage);

        // When
        ChatMessageResponse result = chatMessageService.sendMessage(roomId, username, imageRequest);

        // Then
        assertThat(result).isNotNull();

        verify(chatMessageRepository).save(argThat(message ->
                message.getMessageType().equals(ChatMessage.MessageType.SYSTEM) &&
                message.getContent().equals("http://example.com/image.jpg")
        ));
    }
}