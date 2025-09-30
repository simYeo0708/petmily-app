package com.petmily.backend.domain.walker.repository;

import com.petmily.backend.domain.walker.entity.WalkerReview;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalkerReviewRepository extends JpaRepository<WalkerReview, Long> {
    
    List<WalkerReview> findByWalkerId(Long walkerId);
    
    List<WalkerReview> findByWalkerIdOrderByCreateTimeDesc(Long walkerId);
    
    @Query("SELECT AVG(wr.rating) FROM WalkerReview wr WHERE wr.walkerId = :walkerId")
    Double findAverageRatingByWalkerId(@Param("walkerId") Long walkerId);
    
    Long countByWalkerId(Long walkerId);
    
    List<WalkerReview> findByUserId(Long userId);
    
    List<WalkerReview> findByUserIdOrderByCreateTimeDesc(Long userId);
    
    Optional<WalkerReview> findByWalkerIdAndUserId(Long walkerId, Long userId);
    
    // Booking-based review validation methods
    Optional<WalkerReview> findByBookingId(Long bookingId);
    
    boolean existsByBookingId(Long bookingId);
    
    // Check if user has completed bookings with the walker
    @Query("SELECT COUNT(wb) FROM WalkBooking wb WHERE wb.userId = :userId AND wb.walkerId = :walkerId AND wb.status = 'COMPLETED'")
    Long countCompletedBookingsByUserAndWalker(@Param("userId") Long userId, @Param("walkerId") Long walkerId);
    
}

