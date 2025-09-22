package com.petmily.backend.api.walker.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoMessageSender {

    private final RestTemplate restTemplate;

    @Value("${kakao.message.api.key}")
    private String kakaoMessageApiKey;

    @Value("${kakao.message.api.admin-key}")
    private String kakaoAdminKey;

    @Value("${kakao.message.api.base-url}")
    private String kakaoBaseUrl;

    /**
     * 카카오톡 친구에게 메시지 발송 (개인용)
     */
    public boolean sendMessageToFriend(String userAccessToken, String message) {
        try {
            String url = kakaoBaseUrl + "/v2/api/talk/memo/default/send";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBearerAuth(userAccessToken);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("template_object", createTextTemplate(message));

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("카카오톡 메시지 발송 성공: {}", message);
                return true;
            } else {
                log.warn("카카오톡 메시지 발송 실패 - Status: {}, Response: {}", 
                        response.getStatusCode(), response.getBody());
                return false;
            }

        } catch (Exception e) {
            log.error("카카오톡 메시지 발송 중 오류 발생", e);
            return false;
        }
    }

    /**
     * 카카오톡 비즈니스 메시지 발송 (알림톡)
     */
    public boolean sendBusinessMessage(String receiverPhoneNumber, String templateCode, String message) {
        try {
            String url = kakaoBaseUrl + "/v1/api/talk/friends/message/default/send";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "KakaoAK " + kakaoAdminKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("receiver_uuids", new String[]{receiverPhoneNumber});
            requestBody.put("template_object", createBusinessTemplate(templateCode, message));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("카카오톡 비즈니스 메시지 발송 성공 - 수신자: {}, 메시지: {}", 
                        receiverPhoneNumber, message);
                return true;
            } else {
                log.warn("카카오톡 비즈니스 메시지 발송 실패 - Status: {}, Response: {}", 
                        response.getStatusCode(), response.getBody());
                return false;
            }

        } catch (Exception e) {
            log.error("카카오톡 비즈니스 메시지 발송 중 오류 발생", e);
            return false;
        }
    }

    /**
     * 카카오톡 텍스트 템플릿 생성
     */
    private String createTextTemplate(String text) {
        return String.format(
            "{" +
            "\"object_type\": \"text\"," +
            "\"text\": \"%s\"," +
            "\"link\": {" +
            "\"web_url\": \"https://petmily.com\"," +
            "\"mobile_web_url\": \"https://petmily.com\"" +
            "}" +
            "}", 
            text.replace("\"", "\\\"").replace("\n", "\\n")
        );
    }

    /**
     * 카카오톡 비즈니스 메시지 템플릿 생성
     */
    private Map<String, Object> createBusinessTemplate(String templateCode, String message) {
        Map<String, Object> template = new HashMap<>();
        template.put("object_type", "text");
        template.put("text", message);
        
        Map<String, String> link = new HashMap<>();
        link.put("web_url", "https://petmily.com");
        link.put("mobile_web_url", "https://petmily.com");
        template.put("link", link);
        
        return template;
    }

    /**
     * 메시지 발송 가능 여부 확인
     */
    public boolean isMessageSendingAvailable() {
        return kakaoMessageApiKey != null && 
               !kakaoMessageApiKey.equals("dummy-message-api-key") &&
               kakaoAdminKey != null && 
               !kakaoAdminKey.equals("dummy-admin-key");
    }

    /**
     * 개발 환경에서 로그로 메시지 출력 (실제 발송 대신)
     */
    public void logMessageForDevelopment(String recipient, String message) {
        log.info("=== 카카오톡 메시지 (개발용 로그) ===");
        log.info("수신자: {}", recipient);
        log.info("메시지: {}", message);
        log.info("====================================");
    }
}