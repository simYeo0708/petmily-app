package com.petmily.backend.api.fcm.controller;

import com.petmily.backend.api.common.dto.ApiResponse;
import com.petmily.backend.api.fcm.FcmService;
import com.petmily.backend.api.fcm.dto.FcmResponseDto;
import com.petmily.backend.api.fcm.dto.FcmSendDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/fcm")
@RequiredArgsConstructor
public class FcmController {

    private final FcmService fcmService;

    /**
     * FCM 푸시 메시지 전송
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<FcmResponseDto>> sendPushMessage(
            @Valid @RequestBody FcmSendDto fcmSendDto) {

        log.info("FCM 푸시 메시지 전송 요청: 제목={}, 대상토큰길이={}",
                fcmSendDto.getTitle(),
                fcmSendDto.getToken() != null ? fcmSendDto.getToken().length() : 0);

        FcmResponseDto result = fcmService.sendMessageTo(fcmSendDto);

        if (result.isSuccess()) {
            log.info("FCM 메시지 전송 성공: messageId={}", result.getMessageId());
            return ResponseEntity.ok(
                ApiResponse.success(result, "푸시 메시지가 성공적으로 전송되었습니다.")
            );
        } else {
            log.warn("FCM 메시지 전송 실패: {}", result.getErrorMessage());
            return ResponseEntity.badRequest().body(
                ApiResponse.error("푸시 메시지 전송에 실패했습니다: " + result.getErrorMessage())
            );
        }
    }

    /**
     * FCM 테스트 메시지 전송 (개발용)
     */
    @PostMapping("/test")
    public ResponseEntity<ApiResponse<FcmResponseDto>> sendTestMessage(
            @RequestParam String token) {

        FcmSendDto testDto = FcmSendDto.builder()
                .token(token)
                .title("테스트 메시지")
                .body("FCM 연동이 정상적으로 작동합니다.")
                .build();

        FcmResponseDto result = fcmService.sendMessageTo(testDto);

        if (result.isSuccess()) {
            return ResponseEntity.ok(
                ApiResponse.success(result, "테스트 메시지가 전송되었습니다.")
            );
        } else {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("테스트 메시지 전송에 실패했습니다: " + result.getErrorMessage())
            );
        }
    }
}
