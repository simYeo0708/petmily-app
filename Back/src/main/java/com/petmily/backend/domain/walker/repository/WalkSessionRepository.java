package com.petmily.backend.domain.walker.repository;

import com.petmily.backend.domain.walker.entity.WalkSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalkSessionRepository extends JpaRepository<WalkSession, Long> {

    /**
     * 사용자의 진행 중인 산책 세션 조회
     */
    Optional<WalkSession> findByUserIdAndStatus(Long userId, WalkSession.WalkSessionStatus status);

    /**
     * 사용자의 모든 산책 세션 조회 (최신순)
     */
    List<WalkSession> findByUserIdOrderByStartTimeDesc(Long userId);

    /**
     * 특정 기간 내 산책 세션 조회
     */
    @Query("SELECT ws FROM WalkSession ws WHERE ws.userId = :userId " +
           "AND ws.startTime BETWEEN :startTime AND :endTime " +
           "ORDER BY ws.startTime DESC")
    List<WalkSession> findByUserIdAndStartTimeBetween(
            @Param("userId") Long userId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    /**
     * 완료된 산책 세션만 조회
     */
    List<WalkSession> findByUserIdAndStatusOrderByStartTimeDesc(
            Long userId, WalkSession.WalkSessionStatus status);
}


