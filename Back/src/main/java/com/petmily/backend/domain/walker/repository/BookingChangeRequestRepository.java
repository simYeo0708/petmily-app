package com.petmily.backend.domain.walker.repository;

import com.petmily.backend.domain.walker.entity.BookingChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingChangeRequestRepository extends JpaRepository<BookingChangeRequest, Long> {

    List<BookingChangeRequest> findByBookingIdOrderByCreateTimeDesc(Long bookingId);

    List<BookingChangeRequest> findByRequestedByUserIdAndStatusOrderByCreateTimeDesc(
        Long userId, BookingChangeRequest.ChangeRequestStatus status);

    List<BookingChangeRequest> findByBooking_WalkerIdAndStatusOrderByCreateTimeDesc(
        Long walkerId, BookingChangeRequest.ChangeRequestStatus status);
}