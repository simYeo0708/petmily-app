package com.petmily.backend.api.fcm.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.petmily.backend.api.fcm.FcmService;
import com.petmily.backend.api.fcm.dto.FcmMessageDto;
import com.petmily.backend.api.fcm.dto.FcmResponseDto;
import com.petmily.backend.api.fcm.dto.FcmSendDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Service
public class FcmServiceImpl implements FcmService {

    @Value("${fcm.project-id:petmily-6d8c6}")
    private String projectId;

    @Value("${fcm.credentials-path:firebase/petmily-6d8c6-firebase-adminsdk-fbsvc-01b05f0a1c.json}")
    private String credentialsPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public FcmResponseDto sendMessageTo(FcmSendDto fcmSendDto) {
        try {
            String message = makeMessage(fcmSendDto);
            RestTemplate restTemplate = createRestTemplate();

            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(message, headers);

            String apiUrl = "https://fcm.googleapis.com/v1/projects/" + projectId + "/messages:send";
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

            log.info("FCM 메시지 전송 성공: {} - {}", fcmSendDto.getTitle(), response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful()) {
                String messageId = extractMessageId(response.getBody());
                return FcmResponseDto.success(messageId, fcmSendDto.getTitle(), fcmSendDto.getBody());
            } else {
                return FcmResponseDto.failure(fcmSendDto.getTitle(), fcmSendDto.getBody(),
                    "HTTP " + response.getStatusCode() + ": " + response.getBody());
            }

        } catch (RestClientException e) {
            log.error("FCM 메시지 전송 실패 - REST 에러: {}", e.getMessage(), e);
            return FcmResponseDto.failure(fcmSendDto.getTitle(), fcmSendDto.getBody(),
                "네트워크 오류: " + e.getMessage());
        } catch (Exception e) {
            log.error("FCM 메시지 전송 실패 - 일반 에러: {}", e.getMessage(), e);
            return FcmResponseDto.failure(fcmSendDto.getTitle(), fcmSendDto.getBody(),
                "시스템 오류: " + e.getMessage());
        }
    }

    private RestTemplate createRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters()
                .add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        return restTemplate;
    }

    private HttpHeaders createHeaders() throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + getAccessToken());
        return headers;
    }

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

    private String makeMessage(FcmSendDto fcmSendDto) throws JsonProcessingException {
        FcmMessageDto fcmMessageDto = FcmMessageDto.builder()
                .message(FcmMessageDto.Message.builder()
                        .token(fcmSendDto.getToken())
                        .notification(FcmMessageDto.Notification.builder()
                                .title(fcmSendDto.getTitle())
                                .body(fcmSendDto.getBody())
                                .image(null)
                                .build()
                        ).build())
                .validateOnly(false)
                .build();

        return objectMapper.writeValueAsString(fcmMessageDto);
    }

    private String extractMessageId(String responseBody) {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            JsonNode nameNode = jsonNode.get("name");
            if (nameNode != null) {
                String fullName = nameNode.asText();
                // "projects/{project}/messages/{message-id}" 형태에서 message-id 추출
                return fullName.substring(fullName.lastIndexOf("/") + 1);
            }
        } catch (Exception e) {
            log.warn("메시지 ID 추출 실패: {}", e.getMessage());
        }
        return "unknown";
    }
}
