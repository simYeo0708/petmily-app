package com.petmily.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String[] CANDIDATE_PATHS = {
        ".env",
        ".env.local",
        "../.env",
        "../.env.local",
        "../Front/.env",
        "../Front/.env.local"
    };

    private static final Map<String, String[]> CUSTOM_ALIASES = Map.of(
        "KAKAO_CLIENT_ID", new String[]{"kakao.map.api.key"},
        "KAKAO_NATIVE_KEY", new String[]{"kakao.native.ios-key", "kakao.native.android-key"},
        "KAKAO_MESSAGE_API_KEY", new String[]{"kakao.message.api.key"},
        "KAKAO_ADMIN_KEY", new String[]{"kakao.message.api.admin-key"},
        "KAKAO_MESSAGE_API_BASE_URL", new String[]{"kakao.message.api.base-url"},
        "SPRING_AI_OPENAI_API_KEY", new String[]{"spring.ai.openai.api-key"}
    );

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> properties = new LinkedHashMap<>();
        for (String candidate : CANDIDATE_PATHS) {
            Path path = Path.of(candidate).normalize();
            Path directory = path.getParent();
            Dotenv dotenv = Dotenv.configure()
                .directory(directory == null ? "." : directory.toString())
                .filename(path.getFileName().toString())
                .ignoreIfMalformed()
                .ignoreIfMissing()
                .load();

            for (DotenvEntry entry : dotenv.entries()) {
                String key = entry.getKey();
                String value = entry.getValue();
                properties.putIfAbsent(key, value);
                String relaxedKey = toRelaxedKey(key);
                if (!relaxedKey.equals(key)) {
                    properties.putIfAbsent(relaxedKey, value);
                }
                for (String alias : CUSTOM_ALIASES.getOrDefault(key, new String[0])) {
                    properties.putIfAbsent(alias, value);
                }
            }
        }

        if (!properties.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("dotenv", properties));
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    private String toRelaxedKey(String key) {
        return key.toLowerCase().replace('_', '.');
    }
}

