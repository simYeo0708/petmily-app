package com.petmily.backend.api.walk.controller;

import com.petmily.backend.api.walk.dto.tracking.WalkTrackResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WalkWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 특정 예약의 실시간 위치를 구독자들에게 브로드캐스트
     */
    public void broadcastLocationUpdate(Long bookingId, WalkTrackResponse locationData){
        String destination = "/sub/walking/" + bookingId + "/location";

        try{
            messagingTemplate.convertAndSend(destination, locationData);
            log.info("위치 업데이트 브로드캐스트 성공 - BookingId: {}, 좌표: ({}, {})",
                    bookingId, locationData.getLatitude(), locationData.getLongitude());
        }catch(Exception e){
            log.error("위치 업데이트 브로드캐스트 실패 - BookingId: {}", bookingId, e);
        }
    }

    /**
     * 산책 상태 변경 브로드캐스트 (시작/종료/일시정지 등)
     */
    public void broadcastWalkingStatus(Long bookingId, String status, Object data){
        String destination = "/sub/walking/" + bookingId + "/status";

        try{
            messagingTemplate.convertAndSend(destination, Map.of(
                    "status", status,
                    "timestamp", LocalDateTime.now(),
                    "data", data
            ));
            log.info("산책 상태 브로드캐스트 성공 - BookingId: {}, Status: {}", bookingId, status);
        }catch(Exception e){
            log.error("산책 상태 브로드캐스트 실패 - BookingId: {}", bookingId, e);
        }
    }

}
