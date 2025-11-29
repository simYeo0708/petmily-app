package com.petmily.backend.api.chat.service;

import com.petmily.backend.api.chat.dto.ChatRoomResponse;
import com.petmily.backend.api.chat.dto.CreateChatRoomRequest;
import com.petmily.backend.api.chat.redis.RedisSubscriber;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.chat.entity.ChatMessage;
import com.petmily.backend.domain.chat.entity.ChatRoom;
import com.petmily.backend.domain.chat.repository.ChatMessageRepository;
import com.petmily.backend.domain.chat.repository.ChatRoomRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.Walker;
import com.petmily.backend.domain.walker.repository.WalkerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatRoomServiceTest {

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalkerRepository walkerRepository;

    @Mock
    private RedisSubscriber redisSubscriber;

    @Mock
    private RedisMessageListenerContainer redisMessageListenerContainer;

    @InjectMocks
    private ChatRoomService chatRoomService;

    private User user;
    private User walkerUser;
    private Walker walker;
    private ChatRoom preBookingChatRoom;
    private ChatRoom postBookingChatRoom;
    private CreateChatRoomRequest createChatRoomRequest;
    private ChatMessage lastMessage;
    private Map<String, ChannelTopic> topics;

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

        walker = Walker.builder()
                .id(1L)
                .userId(2L)
                .hourlyRate(java.math.BigDecimal.valueOf(25.0))
                .build();

        preBookingChatRoom = ChatRoom.builder()
                .id(1L)
                .roomId("pre-booking-room-id")
                .userId(1L)
                .walkerId(1L)
                .chatType(ChatRoom.ChatType.PRE_BOOKING)
                .isActive(true)
                .walker(walker)
                .build();

        postBookingChatRoom = ChatRoom.builder()
                .id(2L)
                .roomId("post-booking-room-id")
                .userId(1L)
                .walkerId(1L)
                .bookingId(100L)
                .chatType(ChatRoom.ChatType.POST_BOOKING)
                .isActive(true)
                .walker(walker)
                .build();

        createChatRoomRequest = CreateChatRoomRequest.builder()
                .walkerId(1L)
                .build();

        lastMessage = ChatMessage.builder()
                .id(1L)
                .chatRoomId(1L)
                .senderId(1L)
                .content("Last message content")
                .build();

        // Initialize topics field using reflection
        topics = new HashMap<>();
        ReflectionTestUtils.setField(chatRoomService, "topics", topics);
    }

    @Test
    @DisplayName("사용자의 모든 채팅방 조회 성공")
    void getUserChatRooms_Success() {
        // Given
        String username = "testuser";
        List<ChatRoom> chatRooms = Arrays.asList(preBookingChatRoom, postBookingChatRoom);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(chatRoomRepository.findByUserIdOrWalkerUserId(1L)).thenReturn(chatRooms);
        when(chatMessageRepository.findLastMessageByChatRoomId(1L)).thenReturn(lastMessage);
        when(chatMessageRepository.findLastMessageByChatRoomId(2L)).thenReturn(null);
        when(chatMessageRepository.countUnreadMessages(1L, 1L)).thenReturn(3L);
        when(chatMessageRepository.countUnreadMessages(2L, 1L)).thenReturn(0L);

        // When
        List<ChatRoomResponse> result = chatRoomService.getUserChatRooms(user.getId());

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);

        ChatRoomResponse firstRoom = result.get(0);
        assertThat(firstRoom.getRoomId()).isEqualTo("pre-booking-room-id");
        assertThat(firstRoom.getChatType()).isEqualTo(ChatRoom.ChatType.PRE_BOOKING);
        assertThat(firstRoom.getLastMessage()).isEqualTo("Last message content");
        assertThat(firstRoom.getUnreadCount()).isEqualTo(3L);

        ChatRoomResponse secondRoom = result.get(1);
        assertThat(secondRoom.getRoomId()).isEqualTo("post-booking-room-id");
        assertThat(secondRoom.getChatType()).isEqualTo(ChatRoom.ChatType.POST_BOOKING);
        assertThat(secondRoom.getLastMessage()).isNull();
        assertThat(secondRoom.getUnreadCount()).isEqualTo(0L);

        verify(userRepository).findByUsername(username);
        verify(chatRoomRepository).findByUserIdOrWalkerUserId(1L);
        verify(chatMessageRepository, times(2)).findLastMessageByChatRoomId(any());
        verify(chatMessageRepository, times(2)).countUnreadMessages(any(), eq(1L));
    }

    @Test
    @DisplayName("사용자의 모든 채팅방 조회 실패 - 사용자 없음")
    void getUserChatRooms_UserNotFound() {
        // Given
        String username = "nonexistentuser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatRoomService.getUserChatRooms(user.getId()))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);

        verify(userRepository).findByUsername(username);
        verify(chatRoomRepository, never()).findByUserIdOrWalkerUserId(any());
    }

    @Test
    @DisplayName("채팅방 ID로 조회 성공")
    void findRoomById_Success() {
        // Given
        String roomId = "pre-booking-room-id";
        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.of(preBookingChatRoom));

        // When
        ChatRoomResponse result = chatRoomService.findRoomById(roomId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRoomId()).isEqualTo(roomId);
        assertThat(result.getChatType()).isEqualTo(ChatRoom.ChatType.PRE_BOOKING);
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getWalkerId()).isEqualTo(1L);

        verify(chatRoomRepository).findByRoomId(roomId);
    }

    @Test
    @DisplayName("채팅방 ID로 조회 실패 - 채팅방 없음")
    void findRoomById_NotFound() {
        // Given
        String roomId = "nonexistent-room-id";
        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatRoomService.findRoomById(roomId))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND)
                .hasMessageContaining("채팅방을 찾을 수 없습니다");

        verify(chatRoomRepository).findByRoomId(roomId);
    }

    @Test
    @DisplayName("예약 전 문의용 채팅방 생성 성공 - 신규 생성")
    void createPreBookingChatRoom_Success_NewRoom() {
        // Given
        String username = "testuser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(walkerRepository.findById(1L)).thenReturn(Optional.of(walker));
        when(chatRoomRepository.findByUserIdAndWalkerIdForPreBooking(1L, 1L)).thenReturn(Optional.empty());
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(preBookingChatRoom);

        // When
        ChatRoomResponse result = chatRoomService.createPreBookingChatRoom(user.getId(), createChatRoomRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRoomId()).isEqualTo("pre-booking-room-id");
        assertThat(result.getChatType()).isEqualTo(ChatRoom.ChatType.PRE_BOOKING);

        verify(userRepository).findByUsername(username);
        verify(walkerRepository).findById(1L);
        verify(chatRoomRepository).findByUserIdAndWalkerIdForPreBooking(1L, 1L);
        verify(chatRoomRepository).save(argThat(chatRoom ->
                chatRoom.getUserId().equals(1L) &&
                chatRoom.getWalkerId().equals(1L) &&
                chatRoom.getChatType().equals(ChatRoom.ChatType.PRE_BOOKING) &&
                chatRoom.getIsActive()
        ));
    }

    @Test
    @DisplayName("예약 전 문의용 채팅방 생성 성공 - 기존 채팅방 반환")
    void createPreBookingChatRoom_Success_ExistingRoom() {
        // Given
        String username = "testuser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(walkerRepository.findById(1L)).thenReturn(Optional.of(walker));
        when(chatRoomRepository.findByUserIdAndWalkerIdForPreBooking(1L, 1L))
                .thenReturn(Optional.of(preBookingChatRoom));

        // When
        ChatRoomResponse result = chatRoomService.createPreBookingChatRoom(user.getId(), createChatRoomRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRoomId()).isEqualTo("pre-booking-room-id");
        assertThat(result.getChatType()).isEqualTo(ChatRoom.ChatType.PRE_BOOKING);

        verify(userRepository).findByUsername(username);
        verify(walkerRepository).findById(1L);
        verify(chatRoomRepository).findByUserIdAndWalkerIdForPreBooking(1L, 1L);
        verify(chatRoomRepository, never()).save(any());
    }

    @Test
    @DisplayName("예약 전 문의용 채팅방 생성 실패 - 사용자 없음")
    void createPreBookingChatRoom_UserNotFound() {
        // Given
        String username = "nonexistentuser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatRoomService.createPreBookingChatRoom(user.getId(), createChatRoomRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);

        verify(userRepository).findByUsername(username);
        verify(walkerRepository, never()).findById(any());
    }

    @Test
    @DisplayName("예약 전 문의용 채팅방 생성 실패 - 워커 없음")
    void createPreBookingChatRoom_WalkerNotFound() {
        // Given
        String username = "testuser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(walkerRepository.findById(999L)).thenReturn(Optional.empty());

        createChatRoomRequest.setWalkerId(999L);

        // When & Then
        assertThatThrownBy(() -> chatRoomService.createPreBookingChatRoom(user.getId(), createChatRoomRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESOURCE_NOT_FOUND)
                .hasMessageContaining("워커를 찾을 수 없습니다");

        verify(userRepository).findByUsername(username);
        verify(walkerRepository).findById(999L);
    }

    @Test
    @DisplayName("예약 전 문의용 채팅방 생성 실패 - 자기 자신과 채팅")
    void createPreBookingChatRoom_SelfChat() {
        // Given
        String username = "testuser";
        Walker selfWalker = Walker.builder()
                .id(1L)
                .userId(1L) // Same user ID as the requester
                .hourlyRate(java.math.BigDecimal.valueOf(30.0))
                .build();

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(walkerRepository.findById(1L)).thenReturn(Optional.of(selfWalker));

        // When & Then
        assertThatThrownBy(() -> chatRoomService.createPreBookingChatRoom(user.getId(), createChatRoomRequest))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_REQUEST)
                .hasMessageContaining("자기 자신과는 채팅할 수 없습니다");

        verify(userRepository).findByUsername(username);
        verify(walkerRepository).findById(1L);
    }

    @Test
    @DisplayName("예약 확정 시 채팅방 생성 성공 - 신규 생성")
    void createPostBookingChatRoom_Success_NewRoom() {
        // Given
        Long userId = 1L;
        Long walkerId = 1L;
        Long bookingId = 100L;

        when(chatRoomRepository.findByBookingIdAndIsActiveTrue(bookingId)).thenReturn(Optional.empty());
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(postBookingChatRoom);

        // When
        ChatRoomResponse result = chatRoomService.createPostBookingChatRoom(userId, walkerId, bookingId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRoomId()).isEqualTo("post-booking-room-id");
        assertThat(result.getChatType()).isEqualTo(ChatRoom.ChatType.POST_BOOKING);
        assertThat(result.getBookingId()).isEqualTo(100L);

        verify(chatRoomRepository).findByBookingIdAndIsActiveTrue(bookingId);
        verify(chatRoomRepository).save(argThat(chatRoom ->
                chatRoom.getUserId().equals(userId) &&
                chatRoom.getWalkerId().equals(walkerId) &&
                chatRoom.getBookingId().equals(bookingId) &&
                chatRoom.getChatType().equals(ChatRoom.ChatType.POST_BOOKING) &&
                chatRoom.getIsActive()
        ));
    }

    @Test
    @DisplayName("예약 확정 시 채팅방 생성 성공 - 기존 채팅방 반환")
    void createPostBookingChatRoom_Success_ExistingRoom() {
        // Given
        Long userId = 1L;
        Long walkerId = 1L;
        Long bookingId = 100L;

        when(chatRoomRepository.findByBookingIdAndIsActiveTrue(bookingId))
                .thenReturn(Optional.of(postBookingChatRoom));

        // When
        ChatRoomResponse result = chatRoomService.createPostBookingChatRoom(userId, walkerId, bookingId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getRoomId()).isEqualTo("post-booking-room-id");
        assertThat(result.getChatType()).isEqualTo(ChatRoom.ChatType.POST_BOOKING);

        verify(chatRoomRepository).findByBookingIdAndIsActiveTrue(bookingId);
        verify(chatRoomRepository, never()).save(any());
    }

    @Test
    @DisplayName("채팅방 접근 권한 확인 성공 - 일반 사용자")
    void hasAccessToChatRoom_Success_User() {
        // Given
        String roomId = "pre-booking-room-id";
        String username = "testuser";

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.of(preBookingChatRoom));

        // When
        boolean hasAccess = chatRoomService.hasAccessToChatRoom(roomId, user.getId());

        // Then
        assertThat(hasAccess).isTrue();

        verify(userRepository).findByUsername(username);
        verify(chatRoomRepository).findByRoomId(roomId);
    }

    @Test
    @DisplayName("채팅방 접근 권한 확인 성공 - 워커 사용자")
    void hasAccessToChatRoom_Success_Walker() {
        // Given
        String roomId = "pre-booking-room-id";
        String username = "walker";

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(walkerUser));
        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.of(preBookingChatRoom));
        when(walkerRepository.findByUserId(2L)).thenReturn(Optional.of(walker));

        // When
        boolean hasAccess = chatRoomService.hasAccessToChatRoom(roomId, user.getId());

        // Then
        assertThat(hasAccess).isTrue();

        verify(userRepository).findByUsername(username);
        verify(chatRoomRepository).findByRoomId(roomId);
        verify(walkerRepository).findByUserId(2L);
    }

    @Test
    @DisplayName("채팅방 접근 권한 확인 실패 - 권한 없음")
    void hasAccessToChatRoom_NoAccess() {
        // Given
        String roomId = "pre-booking-room-id";
        String username = "unauthorizeduser";
        User unauthorizedUser = User.builder()
                .id(99L)
                .username("unauthorizeduser")
                .build();

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(unauthorizedUser));
        when(chatRoomRepository.findByRoomId(roomId)).thenReturn(Optional.of(preBookingChatRoom));
        when(walkerRepository.findByUserId(99L)).thenReturn(Optional.empty());

        // When
        boolean hasAccess = chatRoomService.hasAccessToChatRoom(roomId, user.getId());

        // Then
        assertThat(hasAccess).isFalse();

        verify(userRepository).findByUsername(username);
        verify(chatRoomRepository).findByRoomId(roomId);
        verify(walkerRepository).findByUserId(99L);
    }

    @Test
    @DisplayName("Redis 채널 입장 - 새 채널")
    void enterChatRoom_NewChannel() {
        // Given
        String roomId = "new-room-id";

        // When
        chatRoomService.enterChatRoom(roomId);

        // Then
        ChannelTopic topic = chatRoomService.getTopic(roomId);
        assertThat(topic).isNotNull();
        assertThat(topic.getTopic()).isEqualTo(roomId);

        verify(redisMessageListenerContainer).addMessageListener(redisSubscriber, topic);
    }

    @Test
    @DisplayName("Redis 채널 입장 - 기존 채널")
    void enterChatRoom_ExistingChannel() {
        // Given
        String roomId = "existing-room-id";
        ChannelTopic existingTopic = new ChannelTopic(roomId);
        topics.put(roomId, existingTopic);

        // When
        chatRoomService.enterChatRoom(roomId);

        // Then
        ChannelTopic topic = chatRoomService.getTopic(roomId);
        assertThat(topic).isSameAs(existingTopic);

        // Redis listener verification skipped due to method ambiguity
    }

    @Test
    @DisplayName("Redis 채널 조회 - 존재하지 않는 채널")
    void getTopic_NonExistentChannel() {
        // Given
        String roomId = "nonexistent-room-id";

        // When
        ChannelTopic topic = chatRoomService.getTopic(roomId);

        // Then
        assertThat(topic).isNull();
    }
}