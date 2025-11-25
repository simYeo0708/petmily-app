package com.petmily.backend.api.notification.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.petmily.backend.api.fcm.dto.FcmMessageDto;
import com.petmily.backend.api.notification.dto.PushNotificationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 실제 푸시 알림 전송을 담당하는 컴포넌트
 * Firebase FCM과 통합하여 실제 푸시 알림을 전송
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PushNotificationSender {

    @Value("${fcm.project-id:petmily-6d8c6}")
    private String projectId;

    @Value("${fcm.credentials-path:firebase/petmily-6d8c6-firebase-adminsdk-fbsvc-01b05f0a1c.json}")
    private String credentialsPath;

    @Value("${fcm.enabled:true}")
    private boolean fcmEnabled;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 단일 토큰으로 전송
     */
    public boolean sendToToken(String token, PushNotificationRequest request) {
        if (!fcmEnabled) {
            logNotificationForDevelopment(token, request);
            return true;
        }

        try {
            String message = createTokenMessage(token, request);
            return sendFcmMessage(message);
        } catch (Exception e) {
            log.error("단일 토큰 푸시 알림 전송 실패: token={}, error={}", maskToken(token), e.getMessage(), e);
            return false;
        }
    }

    /**
     * 여러 토큰으로 전송 (최대 500개 제한)
     */
    public int sendToTokens(List<String> tokens, PushNotificationRequest request) {
        if (!fcmEnabled) {
            log.info("FCM 비활성화 상태 - {} 개 토큰에 대한 푸시 알림 시뮬레이션", tokens.size());
            logNotificationForDevelopment("multiple-tokens", request);
            return tokens.size();
        }

        int successCount = 0;
        int batchSize = 100; // FCM 권장 배치 크기

        for (int i = 0; i < tokens.size(); i += batchSize) {
            List<String> batch = tokens.subList(i, Math.min(i + batchSize, tokens.size()));

            for (String token : batch) {
                if (sendToToken(token, request)) {
                    successCount++;
                }
                // FCM 속도 제한 방지를 위한 짧은 대기
                try { Thread.sleep(10); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
        }

        log.info("다중 토큰 푸시 알림 전송 완료: 성공 {}/{}", successCount, tokens.size());
        return successCount;
    }

    /**
     * 토픽으로 전송
     */
    public boolean sendToTopic(String topic, PushNotificationRequest request) {
        if (!fcmEnabled) {
            logNotificationForDevelopment("topic:" + topic, request);
            return true;
        }

        try {
            String message = createTopicMessage(topic, request);
            return sendFcmMessage(message);
        } catch (Exception e) {
            log.error("토픽 푸시 알림 전송 실패: topic={}, error={}", topic, e.getMessage(), e);
            return false;
        }
    }

    /**
     * 조건부 전송
     */
    public boolean sendToCondition(String condition, PushNotificationRequest request) {
        if (!fcmEnabled) {
            logNotificationForDevelopment("condition:" + condition, request);
            return true;
        }

        try {
            String message = createConditionMessage(condition, request);
            return sendFcmMessage(message);
        } catch (Exception e) {
            log.error("조건부 푸시 알림 전송 실패: condition={}, error={}", condition, e.getMessage(), e);
            return false;
        }
    }

    /**
     * FCM 메시지 실제 전송
     */
    private boolean sendFcmMessage(String message) {
        try {
            RestTemplate restTemplate = createRestTemplate();
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(message, headers);

            String apiUrl = "https://fcm.googleapis.com/v1/projects/" + projectId + "/messages:send";
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.debug("FCM 메시지 전송 성공: {}", response.getStatusCode());
                return true;
            } else {
                log.warn("FCM 메시지 전송 실패: {}", response.getStatusCode());
                return false;
            }

        } catch (RestClientException e) {
            log.error("FCM 메시지 전송 REST 에러: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("FCM 메시지 전송 일반 에러: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 토큰 대상 메시지 생성
     */
    private String createTokenMessage(String token, PushNotificationRequest request) throws Exception {
        return createFcmMessage(token, null, null, request);
    }

    /**
     * 토픽 대상 메시지 생성
     */
    private String createTopicMessage(String topic, PushNotificationRequest request) throws Exception {
        return createFcmMessage(null, topic, null, request);
    }

    /**
     * 조건 대상 메시지 생성
     */
    private String createConditionMessage(String condition, PushNotificationRequest request) throws Exception {
        return createFcmMessage(null, null, condition, request);
    }

    /**
     * FCM 메시지 생성
     */
    private String createFcmMessage(String token, String topic, String condition, PushNotificationRequest request) throws Exception {
        // 메시지 타겟 설정
        FcmMessageDto.Message.MessageBuilder messageBuilder = FcmMessageDto.Message.builder();

        if (token != null) {
            messageBuilder.token(token);
        } else if (topic != null) {
            messageBuilder.topic(topic);
        } else if (condition != null) {
            messageBuilder.condition(condition);
        }

        // 알림 내용 설정
        FcmMessageDto.Notification notification = FcmMessageDto.Notification.builder()
                .title(request.getTitle())
                .body(request.getBody())
                .image(request.getImageUrl())
                .build();

        messageBuilder.notification(notification);

        // 추가 데이터 설정
        if (request.getData() != null && !request.getData().isEmpty()) {
            Map<String, String> dataMap = new HashMap<>();
            request.getData().forEach((key, value) ->
                dataMap.put(key, value != null ? value.toString() : ""));
            messageBuilder.data(dataMap);
        }

        // Android 설정
        if (request.getPriority() != null || request.getSound() != null) {
            Map<String, Object> androidConfig = new HashMap<>();
            Map<String, Object> androidNotification = new HashMap<>();

            if (request.getPriority() != null) {
                androidConfig.put("priority", "high".equalsIgnoreCase(request.getPriority()) ? "high" : "normal");
            }
            if (request.getSound() != null) {
                androidNotification.put("sound", request.getSound());
            }
            if (!androidNotification.isEmpty()) {
                androidConfig.put("notification", androidNotification);
            }
            messageBuilder.android(androidConfig);
        }

        // iOS APNS 설정
        if (request.getBadge() != null || request.getSound() != null) {
            Map<String, Object> apnsConfig = new HashMap<>();
            Map<String, Object> apnsPayload = new HashMap<>();
            Map<String, Object> aps = new HashMap<>();

            if (request.getBadge() != null) {
                aps.put("badge", request.getBadge());
            }
            if (request.getSound() != null) {
                aps.put("sound", request.getSound());
            }
            if (!aps.isEmpty()) {
                apnsPayload.put("aps", aps);
                apnsConfig.put("payload", apnsPayload);
                messageBuilder.apns(apnsConfig);
            }
        }

        FcmMessageDto fcmMessageDto = FcmMessageDto.builder()
                .message(messageBuilder.build())
                .validateOnly(false)
                .build();

        return objectMapper.writeValueAsString(fcmMessageDto);
    }

    /**
     * RestTemplate 생성
     */
    private RestTemplate createRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters()
                .add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        return restTemplate;
    }

    /**
     * HTTP 헤더 생성
     */
    private HttpHeaders createHeaders() throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + getAccessToken());
        return headers;
    }

    /**
     * Firebase 인증 토큰 획득
     */
    private String getAccessToken() throws IOException {
        try {
            GoogleCredentials googleCredentials = GoogleCredentials
                    .fromStream(new ClassPathResource(credentialsPath).getInputStream())
                    .createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));

            googleCredentials.refreshIfExpired();
            return googleCredentials.getAccessToken().getTokenValue();
        } catch (IOException e) {
            log.error("Firebase 인증 토큰 생성 실패: {}", e.getMessage());
            throw new IOException("Firebase 인증 실패", e);
        }
    }

    /**
     * 개발 환경용 로그 출력
     */
    private void logNotificationForDevelopment(String target, PushNotificationRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("\n=== PUSH NOTIFICATION (DEV) ===\n");
        sb.append("Target: ").append(target).append("\n");
        sb.append("Title: ").append(request.getTitle()).append("\n");
        sb.append("Body: ").append(request.getBody()).append("\n");
        sb.append("Priority: ").append(request.getPriority()).append("\n");

        if (request.getData() != null && !request.getData().isEmpty()) {
            sb.append("Data: ").append(request.getData()).append("\n");
        }

        if (request.getImageUrl() != null) {
            sb.append("Image: ").append(request.getImageUrl()).append("\n");
        }

        sb.append("==============================");
        log.info(sb.toString());
    }

    /**
     * 토큰 마스킹 (보안)
     */
    private String maskToken(String token) {
        if (token == null || token.length() < 10) {
            return "***";
        }
        return token.substring(0, 6) + "***" + token.substring(token.length() - 4);
    }

    /**
     * FCM 전송 가능 여부 확인
     */
    public boolean isPushNotificationAvailable() {
        try {
            if (!fcmEnabled) {
                return false;
            }
            // 간단한 토큰 획득 테스트
            getAccessToken();
            return true;
        } catch (Exception e) {
            log.warn("FCM 사용 불가: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 토큰 유효성 검증
     */
    public boolean validateToken(String token) {
        return token != null && token.length() > 50 && token.matches("^[a-zA-Z0-9_:-]+$");
    }
}