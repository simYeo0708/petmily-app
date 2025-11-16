package com.petmily.backend.api.fcm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class FcmMessageDto {

    private boolean validateOnly;
    private FcmMessageDto.Message message;

    @Builder
    @AllArgsConstructor
    @Getter
    public static class Message{
        private FcmMessageDto.Notification notification;
        private String token;
        private String topic;
        private String condition;
        private Map<String, String> data;
        private Map<String, Object> android;
        private Map<String, Object> apns;
    }

    @Builder
    @AllArgsConstructor
    @Getter
    public static class Notification{
        private String title;
        private String body;
        private String image;
    }

}
