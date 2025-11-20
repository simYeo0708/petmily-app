package com.petmily.backend.domain.user.repository;

import com.petmily.backend.domain.user.entity.NotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {

    /**
     * 사용자 ID로 알림 설정 조회
     */
    Optional<NotificationSetting> findByUserId(Long userId);

    /**
     * 사용자 ID로 알림 설정 존재 여부 확인
     */
    boolean existsByUserId(Long userId);

    /**
     * 사용자 ID로 알림 설정 삭제
     */
    void deleteByUserId(Long userId);
}