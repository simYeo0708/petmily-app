package com.petmily.backend.api.fcm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FcmResponseDto {

    private boolean success;
    private String messageId;
    private String title;
    private String body;
    private LocalDateTime sentAt;
    private String errorMessage;

    public static FcmResponseDto success(String messageId, String title, String body) {
        return FcmResponseDto.builder()
                .success(true)
                .messageId(messageId)
                .title(title)
                .body(body)
                .sentAt(LocalDateTime.now())
                .build();
    }

    public static FcmResponseDto failure(String title, String body, String errorMessage) {
        return FcmResponseDto.builder()
                .success(false)
                .title(title)
                .body(body)
                .errorMessage(errorMessage)
                .sentAt(LocalDateTime.now())
                .build();
    }
}