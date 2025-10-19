package com.petmily.backend.domain.walk.repository;

import com.petmily.backend.domain.walk.entity.BookingChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingChangeRequestRepository extends JpaRepository<BookingChangeRequest, Long> {

    List<BookingChangeRequest> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    List<BookingChangeRequest> findByBooking_WalkerIdAndStatusOrderByCreatedAtDesc(
        Long walkerId, BookingChangeRequest.ChangeRequestStatus status);

    List<BookingChangeRequest> findByRequestedByUserIdAndStatusOrderByCreatedAtDesc(
        Long userId, BookingChangeRequest.ChangeRequestStatus status);

    List<BookingChangeRequest> findByBooking_UserIdAndStatusOrderByCreatedAtDesc(
        Long userId, BookingChangeRequest.ChangeRequestStatus status);
}