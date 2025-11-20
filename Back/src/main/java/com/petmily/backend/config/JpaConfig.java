package com.petmily.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaRepositories(basePackages = "com.petmily.backend.domain")
@EnableJpaAuditing
public class JpaConfig {
}

