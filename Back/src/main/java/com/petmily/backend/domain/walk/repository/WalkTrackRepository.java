package com.petmily.backend.domain.walk.repository;

import com.petmily.backend.domain.walk.entity.WalkTrack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalkTrackRepository extends JpaRepository<WalkTrack, Long> {

    /**
     * 특정 예약의 모든 위치 추적 데이터를 시간순으로 조회
     */
    List<WalkTrack> findByBookingIdOrderByTimestampAsc(Long bookingId);

    /**
     * 특정 예약의 특정 기간 내 위치 추적 데이터 조회
     */
    @Query("SELECT wt FROM WalkTrack wt WHERE wt.bookingId = :bookingId " +
           "AND wt.timestamp BETWEEN :startTime AND :endTime " +
           "ORDER BY wt.timestamp ASC")
    List<WalkTrack> findByBookingIdAndTimestampBetween(
            @Param("bookingId") Long bookingId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    /**
     * 특정 예약의 최신 위치 정보 조회
     */
    @Query("SELECT wt FROM WalkTrack wt WHERE wt.bookingId = :bookingId " +
           "ORDER BY wt.timestamp DESC LIMIT 1")
    Optional<WalkTrack> findLatestByBookingId(@Param("bookingId") Long bookingId);

    /**
     * 특정 예약의 특정 타입의 위치 정보들 조회
     */
    List<WalkTrack> findByBookingIdAndTrackTypeOrderByTimestampAsc(
            Long bookingId, WalkTrack.TrackType trackType);

    /**
     * 특정 예약의 시작점과 종료점 조회
     */
    @Query("SELECT wt FROM WalkTrack wt WHERE wt.bookingId = :bookingId " +
           "AND wt.trackType IN ('START', 'END') ORDER BY wt.timestamp ASC")
    List<WalkTrack> findStartAndEndPoints(@Param("bookingId") Long bookingId);

    /**
     * 특정 예약의 총 거리 계산을 위한 경로 포인트들 조회
     */
    @Query("SELECT wt FROM WalkTrack wt WHERE wt.bookingId = :bookingId " +
           "AND wt.trackType IN ('START', 'WALKING', 'END') " +
           "ORDER BY wt.timestamp ASC")
    List<WalkTrack> findPathPointsByBookingId(@Param("bookingId") Long bookingId);

    /**
     * 특정 시간 이후의 위치 데이터 조회 (실시간 업데이트용)
     */
    @Query("SELECT wt FROM WalkTrack wt WHERE wt.bookingId = :bookingId " +
           "AND wt.timestamp > :afterTime ORDER BY wt.timestamp ASC")
    List<WalkTrack> findByBookingIdAndTimestampAfter(
            @Param("bookingId") Long bookingId,
            @Param("afterTime") LocalDateTime afterTime);

    /**
     * 예약별 위치 데이터 개수 조회
     */
    long countByBookingId(Long bookingId);

    /**
     * 오래된 위치 데이터 삭제 (데이터 정리용)
     */
    @Query("DELETE FROM WalkTrack wt WHERE wt.timestamp < :cutoffTime")
    void deleteOldTracks(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * 특정 예약의 가장 최근 위치 정보 조회 (검증용)
     */
    Optional<WalkTrack> findTopByBookingIdOrderByTimestampDesc(Long bookingId);

    /**
     * 특정 예약의 최근 5개 위치 정보 조회 (패턴 분석용)
     */
    @Query("SELECT wt FROM WalkTrack wt WHERE wt.bookingId = :bookingId " +
           "ORDER BY wt.timestamp DESC LIMIT 5")
    List<WalkTrack> findTop5ByBookingIdOrderByTimestampDesc(@Param("bookingId") Long bookingId);
}
