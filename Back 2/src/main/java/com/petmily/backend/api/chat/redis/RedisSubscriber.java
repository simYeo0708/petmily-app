package com.petmily.backend.api.chat.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petmily.backend.api.chat.dto.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class RedisSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessageSendingOperations messageTemplate;

    @Override
    public void onMessage(Message message, byte[] pattern){
        try{
            String publishMessage = redisTemplate
                    .getStringSerializer()
                    .deserialize(message.getBody());

            ChatMessageResponse roomMessage = objectMapper.readValue(publishMessage, ChatMessageResponse.class);
            // roomUuid를 기반으로 WebSocket 경로 생성 (chatRoomId 대신 roomUuid 사용)
            messageTemplate.convertAndSend("/sub/chat/room/" + roomMessage.getChatRoomId(), roomMessage);
        } catch (JsonProcessingException e){
            log.error("Redis 메시지 처리 중 오류 발생", e);
            throw new RuntimeException(e);
        }
    }

}
