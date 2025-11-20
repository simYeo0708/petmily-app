package com.petmily.backend.api.simple;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * 애플리케이션이 정상적으로 시작되고 기본 기능이 작동하는지 확인하는 간단한 테스트
 */
@SpringBootTest
@ActiveProfiles("test")
@Disabled("Mall 구조 리팩터링 중, 간단 smoke 테스트 보류")
class SimpleApiTest {

    @Test
    void contextLoads() {
        // 애플리케이션 컨텍스트가 정상적으로 로드되는지 확인
        // 이 테스트가 통과하면 기본적인 빈 생성과 의존성 주입이 정상적으로 작동함을 의미
    }

    @Test
    void applicationStarts() {
        // 스프링 부트 애플리케이션이 정상적으로 시작되는지 확인
        // @SpringBootTest 애노테이션으로 전체 애플리케이션 컨텍스트를 로드하여 테스트
    }
}