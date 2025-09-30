package com.petmily.backend.domain.walk.repository;

import com.petmily.backend.domain.walk.entity.WalkDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalkDetailRepository extends JpaRepository<WalkDetail, Long> {

    // 예약 ID로 산책 상세 정보 조회
    Optional<WalkDetail> findByWalkBookingId(Long walkBookingId);

    // 상태별 산책 상세 조회
    List<WalkDetail> findByWalkStatus(WalkDetail.WalkStatus walkStatus);

    // 특정 기간 내 완료된 산책 조회
    @Query("SELECT wd FROM WalkDetail wd WHERE wd.walkStatus = 'COMPLETED' AND wd.actualStartTime BETWEEN :startDate AND :endDate")
    List<WalkDetail> findCompletedWalksBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // 진행 중인 산책 조회
    @Query("SELECT wd FROM WalkDetail wd WHERE wd.walkStatus IN ('IN_PROGRESS', 'PAUSED')")
    List<WalkDetail> findActiveWalks();

    // 총 산책 거리 계산
    @Query("SELECT SUM(wd.totalDistance) FROM WalkDetail wd JOIN wd.walkBooking wb WHERE wb.userId = :userId AND wd.walkStatus = 'COMPLETED'")
    Double calculateTotalDistanceByUserId(@Param("userId") Long userId);

    // 워커별 평균 산책 거리
    @Query("SELECT AVG(wd.totalDistance) FROM WalkDetail wd JOIN wd.walkBooking wb WHERE wb.walkerId = :walkerId AND wd.walkStatus = 'COMPLETED'")
    Double calculateAverageDistanceByWalkerId(@Param("walkerId") Long walkerId);
}