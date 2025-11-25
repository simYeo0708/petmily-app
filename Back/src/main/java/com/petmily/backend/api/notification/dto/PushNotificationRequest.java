package com.petmily.backend.api.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PushNotificationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Body is required")
    private String body;

    private Map<String, Object> data; // 추가 데이터

    // 대상 설정 (하나만 사용)
    private Long userId; // 특정 사용자
    private List<String> tokens; // 특정 토큰들
    private String topic; // 토픽 구독자들
    private String condition; // 조건부 전송

    // 알림 설정
    private String imageUrl;
    private String sound;
    private Integer badge;
    private String priority; // high, normal
}