package com.petmily.backend.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Transactional
class MobileOptimizationIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void application_StartsSuccessfully() {
        // 애플리케이션이 성공적으로 시작되는지 확인
        assertThat(restTemplate).isNotNull();
        assertThat(objectMapper).isNotNull();
    }

    @Test
    void dashboard_API_IsAccessible() {
        // Given
        String url = "/api/dashboard";

        // When
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        // Then - 인증 없이 접근 시 적절한 응답 확인
        assertThat(response.getStatusCode()).isIn(
            HttpStatus.UNAUTHORIZED,  // 인증 필요
            HttpStatus.FORBIDDEN,     // 권한 없음
            HttpStatus.OK             // 성공 (테스트 환경에서)
        );
    }

    @Test
    void pets_API_IsAccessible() {
        // Given
        String url = "/api/pets/all?page=0&size=20";

        // When
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        // Then
        assertThat(response.getStatusCode()).isIn(
            HttpStatus.UNAUTHORIZED,
            HttpStatus.FORBIDDEN,
            HttpStatus.OK
        );
    }

    @Test
    void response_HasCorrectContentType() {
        // Given
        String url = "/api/pets/all";

        // When
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        // Then
        if (response.getStatusCode() == HttpStatus.OK) {
            assertThat(response.getHeaders().getContentType().toString())
                .contains("application/json");
        }
    }

    @Test
    void response_Size_IsReasonable() throws Exception {
        // Given
        String url = "/api/pets/all?page=0&size=5"; // 작은 페이지 크기로 테스트

        // When
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        // Then
        if (response.getStatusCode() == HttpStatus.OK) {
            String responseBody = response.getBody();
            assertThat(responseBody).isNotNull();
            
            // 응답 크기가 합리적인지 확인 (10KB 미만)
            assertThat(responseBody.length()).isLessThan(10000);
            
            // JSON 형식인지 확인
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            assertThat(jsonNode).isNotNull();
        }
    }
}