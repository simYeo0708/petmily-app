package com.petmily.backend.config;

import com.petmily.backend.api.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DevTestUserInitializer implements ApplicationRunner {

    private final DevTestUserProperties devTestUserProperties;
    private final AuthService authService;

    @Override
    public void run(ApplicationArguments args) {
        if (!devTestUserProperties.isEnabled()) {
            return;
        }

        try {
            authService.ensureDevTestUser();
            log.info("✅ Dev test user ensured at startup.");
        } catch (Exception e) {
            log.warn("⚠️  Failed to ensure dev test user at startup: {}", e.getMessage(), e);
        }
    }
}

