package com.petmily.backend.config;

import com.petmily.backend.domain.chat.entity.ChatRoom;
import com.petmily.backend.domain.chat.repository.ChatRoomRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TestDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("=== 테스트 데이터 초기화 시작 ===");

        // 테스트 유저 생성
        if (!userRepository.findByUsername("user1").isPresent()) {
            User user1 = User.builder()
                    .username("user1")
                    .name("테스트유저1")
                    .email("user1@test.com")
                    .password("password")
                    .phone("010-1111-1111")
                    .build();
            userRepository.save(user1);
            log.info("테스트 유저 생성: user1");
        }

        if (!userRepository.findByUsername("user2").isPresent()) {
            User user2 = User.builder()
                    .username("user2")
                    .name("테스트유저2")
                    .email("user2@test.com")
                    .password("password")
                    .phone("010-2222-2222")
                    .build();
            userRepository.save(user2);
            log.info("테스트 유저 생성: user2");
        }

        // 테스트 채팅방 생성
        if (!chatRoomRepository.findByRoomId("test-room").isPresent()) {
            User user1 = userRepository.findByUsername("user1").get();

            ChatRoom testRoom = ChatRoom.builder()
                    .roomId("test-room")
                    .userId(user1.getId())
                    .walkerId(null)  // 워커 없이 테스트
                    .bookingId(null)
                    .chatType(ChatRoom.ChatType.PRE_BOOKING)
                    .isActive(true)
                    .build();
            chatRoomRepository.save(testRoom);
            log.info("테스트 채팅방 생성: test-room");
        }

        log.info("=== 테스트 데이터 초기화 완료 ===");
    }
}