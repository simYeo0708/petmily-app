package com.petmily.backend.domain.walk.repository;

import com.petmily.backend.domain.walk.entity.WalkingTrack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalkTrackRepository extends JpaRepository<WalkingTrack, Long> {

    /**
     * 특정 예약의 모든 위치 추적 데이터를 시간순으로 조회
     */
    List<WalkingTrack> findByBookingIdOrderByTimestampAsc(Long bookingId);

    /**
     * 특정 시간 이후의 위치 데이터 조회 (실시간 업데이트용)
     */
    @Query("SELECT wt FROM WalkingTrack wt WHERE wt.bookingId = :bookingId " +
           "AND wt.timestamp > :afterTime ORDER BY wt.timestamp ASC")
    List<WalkingTrack> findByBookingIdAndTimestampAfter(
            @Param("bookingId") Long bookingId,
            @Param("afterTime") LocalDateTime afterTime);

    /**
     * 특정 예약의 가장 최근 위치 정보 조회 (검증용)
     */
    Optional<WalkingTrack> findTopByBookingIdOrderByTimestampDesc(Long bookingId);

    /**
     * 특정 예약의 최근 5개 위치 정보 조회 (패턴 분석용)
     */
    @Query("SELECT wt FROM WalkingTrack wt WHERE wt.bookingId = :bookingId " +
           "ORDER BY wt.timestamp DESC LIMIT 5")
    List<WalkingTrack> findTop5ByBookingIdOrderByTimestampDesc(@Param("bookingId") Long bookingId);

    /**
     * 특정 산책 세션의 모든 위치 추적 데이터를 시간순으로 조회
     */
    List<WalkingTrack> findByWalkSessionIdOrderByTimestampAsc(Long walkSessionId);

    /**
     * 특정 산책 세션의 경로 포인트들 조회
     */
    @Query("SELECT wt FROM WalkingTrack wt WHERE wt.walkSessionId = :walkSessionId " +
           "AND wt.trackType IN ('START', 'WALKING', 'END') " +
           "ORDER BY wt.timestamp ASC")
    List<WalkingTrack> findPathPointsByWalkSessionId(@Param("walkSessionId") Long walkSessionId);
}
