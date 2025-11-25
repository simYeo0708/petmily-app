package com.petmily.backend.domain.walk.repository;

import com.petmily.backend.domain.walk.entity.WalkBooking;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WalkBookingRepository extends JpaRepository<WalkBooking, Long> {

    // 사용자별 예약 조회
    List<WalkBooking> findByUserId(Long userId);

    // 상태별 예약 조회
    List<WalkBooking> findByUserIdAndStatus(Long userId, WalkBooking.BookingStatus status);

    // 여러 상태로 조회
    List<WalkBooking> findByUserIdAndStatusIn(Long userId, List<WalkBooking.BookingStatus> statuses);

    // 최근 예약 조회 (상태별, 생성시간 역순)
    List<WalkBooking> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, WalkBooking.BookingStatus status);

    // 예정된 예약 조회 (상태별, 날짜 순)
    List<WalkBooking> findByUserIdAndStatusInOrderByDateAsc(Long userId, List<WalkBooking.BookingStatus> statuses);

    // 특정 시간 이후 완료된 예약 조회
    List<WalkBooking> findByUserIdAndStatusAndCreatedAtAfter(Long userId, WalkBooking.BookingStatus status, LocalDateTime time);

    // WalkerBookingService에서 필요한 추가 메서드들
    List<WalkBooking> findByUserIdOrderByDateDesc(Long userId);
    List<WalkBooking> findByWalkerIdOrderByDateDesc(Long walkerId);

    // 오픈 요청 관련 메서드들
    List<WalkBooking> findByBookingMethodAndStatusOrderByCreatedAtDesc(
            WalkBooking.BookingMethod bookingMethod, WalkBooking.BookingStatus status);

    List<WalkBooking> findByUserIdAndBookingMethodAndStatusOrderByCreatedAtDesc(
            Long userId, WalkBooking.BookingMethod bookingMethod, WalkBooking.BookingStatus status);

    List<WalkBooking> findByUserIdAndBookingMethodAndStatus(
            Long userId, WalkBooking.BookingMethod bookingMethod, WalkBooking.BookingStatus status);

    boolean existsByUserIdAndWalkerIdAndStatus(
            Long userId, Long walkerId, WalkBooking.BookingStatus status);

    // DashboardService용 추가 메서드들
    List<WalkBooking> findByPetIdAndStatusAndCreatedAtAfter(
            Long petId, WalkBooking.BookingStatus status, LocalDateTime startTime);

    // Additional method for WalkProgressScheduler
    List<WalkBooking> findByStatus(WalkBooking.BookingStatus status);
}