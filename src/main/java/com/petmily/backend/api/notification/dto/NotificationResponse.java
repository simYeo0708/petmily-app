package com.petmily.backend.api.notification.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {
    private Long id;
    private String type; // BOOKING_CONFIRMED, WALK_STARTED, WALK_COMPLETED, etc.
    private String title;
    private String message;
    private Object data; // 추가 데이터 (예: 예약 정보)
    private Boolean isRead;
    private LocalDateTime createdAt;
    
    // 모바일 푸시 알림용 필드
    private String priority; // HIGH, NORMAL, LOW
    private String category; // 알림 카테고리
    private String sound; // 알림 소리
    private Boolean badge; // 앱 아이콘 배지 표시 여부
}