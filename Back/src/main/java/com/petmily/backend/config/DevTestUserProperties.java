package com.petmily.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "petmily.dev.test-user")
public class DevTestUserProperties {

    /**
     * 개발용 테스트 계정 자동 생성 기능 사용 여부
     */
    private boolean enabled = true;

    /**
     * 개발용 테스트 계정 사용자명
     */
    private String username = "asdf";

    /**
     * 개발용 테스트 계정 비밀번호 (평문으로 입력, 런타임에 해시 처리)
     */
    private String password = "asdf";

    /**
     * 개발용 테스트 계정 이메일
     */
    private String email = "asdf@test.com";

    /**
     * 개발용 테스트 계정 표시 이름
     */
    private String name = "Asdf Tester";
}

