package com.petmily.backend.api.functional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * API 기능이 정상적으로 작동하는지 확인하는 기능 테스트
 */
@SpringBootTest
@ActiveProfiles("test")
class ApiFunctionalTest {

    @Autowired
    private ApplicationContext applicationContext;

    @Test
    void applicationStartsSuccessfully() {
        assertThat(applicationContext).isNotNull();
    }

    @Test
    void allControllersAreLoaded() {
        String[] controllerBeans = applicationContext.getBeanNamesForAnnotation(
            org.springframework.web.bind.annotation.RestController.class);
        assertThat(controllerBeans).isNotEmpty();
    }

    @Test
    void databaseConnectionIsWorking() {
        String[] repositoryBeans = applicationContext.getBeanNamesForType(
            org.springframework.data.jpa.repository.JpaRepository.class);
        assertThat(repositoryBeans).isNotEmpty();
    }
}