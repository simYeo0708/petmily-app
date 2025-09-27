package com.petmily.backend.domain.walker.repository;

import com.petmily.backend.domain.walker.entity.WalkerBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WalkerBookingRepository extends JpaRepository<WalkerBooking, Long> {
    
    List<WalkerBooking> findByUserId(Long userId);
    
    List<WalkerBooking> findByUserIdOrderByDateDesc(Long userId);
    
    List<WalkerBooking> findByWalkerId(Long walkerId);
    
    List<WalkerBooking> findByWalkerIdOrderByDateDesc(Long walkerId);
    
    @Query("SELECT wb FROM WalkerBooking wb WHERE wb.walkerId = :walkerId AND wb.date BETWEEN :startDate AND :endDate")
    List<WalkerBooking> findByWalkerIdAndDateBetween(@Param("walkerId") Long walkerId, 
                                                   @Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);
    
    List<WalkerBooking> findByStatus(WalkerBooking.BookingStatus status);
    
    // 모바일 최적화용 추가 메소드들
    List<WalkerBooking> findByUserIdAndStatus(Long userId, WalkerBooking.BookingStatus status);
    
    List<WalkerBooking> findByUserIdAndStatusIn(Long userId, List<WalkerBooking.BookingStatus> statuses);
    
    List<WalkerBooking> findByWalkerIdAndStatusIn(Long walkerId, List<WalkerBooking.BookingStatus> statuses);
    
    @Query("SELECT wb FROM WalkerBooking wb WHERE wb.userId = :userId AND wb.status IN :statuses ORDER BY wb.date DESC")
    List<WalkerBooking> findRecentBookingsByUserAndStatus(@Param("userId") Long userId, 
                                                         @Param("statuses") List<WalkerBooking.BookingStatus> statuses);
    
    @Query("SELECT COUNT(wb) FROM WalkerBooking wb WHERE wb.userId = :userId AND wb.status = :status")
    int countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") WalkerBooking.BookingStatus status);
    
    // 오픈 요청 관련 메서드들
    List<WalkerBooking> findByBookingMethodAndStatusOrderByCreateTimeDesc(
            WalkerBooking.BookingMethod bookingMethod, WalkerBooking.BookingStatus status);
    
    List<WalkerBooking> findByUserIdAndBookingMethodAndStatusOrderByCreateTimeDesc(
            Long userId, WalkerBooking.BookingMethod bookingMethod, WalkerBooking.BookingStatus status);
    
    List<WalkerBooking> findByUserIdAndBookingMethodAndStatus(
            Long userId, WalkerBooking.BookingMethod bookingMethod, WalkerBooking.BookingStatus status);
    
    boolean existsByUserIdAndWalkerIdAndStatus(
            Long userId, Long walkerId, WalkerBooking.BookingStatus status);

    // DashboardService용 추가 메서드들
    List<WalkerBooking> findByPetIdAndStatusAndActualStartTimeAfter(
            Long petId, WalkerBooking.BookingStatus status, LocalDateTime startTime);

    List<WalkerBooking> findByUserIdAndStatusOrderByCreateTimeDesc(
            Long userId, WalkerBooking.BookingStatus status);

    List<WalkerBooking> findByUserIdAndStatusInOrderByDateAsc(
            Long userId, List<WalkerBooking.BookingStatus> statuses);

    List<WalkerBooking> findByUserIdAndStatusAndActualStartTimeAfter(
            Long userId, WalkerBooking.BookingStatus status, LocalDateTime startTime);
}

