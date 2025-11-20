package com.petmily.backend.api.walk.service.booking;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.walk.dto.booking.request.WalkBookingRequest;
import com.petmily.backend.api.walk.dto.booking.response.WalkBookingResponse;
import com.petmily.backend.api.walk.service.validation.ValidationService;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walk.repository.WalkBookingRepository;
import com.petmily.backend.domain.walker.entity.Walker;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DirectBookingService {

    private final WalkBookingRepository walkBookingRepository;
    private final WalkBookingService walkBookingService;
    private final ValidationService validationService;

    @Transactional
    public WalkBookingResponse createWalkerSelectionBooking(Long userId, WalkBookingRequest request) {
        User user = walkBookingService.findUserById(userId);

        if (request.getWalkerId() == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Walker ID is required for walker selection booking");
        }

        Walker walker = walkBookingService.findWalkerById(request.getWalkerId());

        if (walker.getStatus() != WalkerStatus.ACTIVE) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Walker is not currently available");
        }

        double hourlyRate = walker.getHourlyRate() != null ? walker.getHourlyRate().doubleValue() : 20000.0;
        double totalPrice = hourlyRate * (request.getDuration() / 60.0);

        WalkBooking booking = new WalkBooking();
        booking.setUserId(user.getId());
        booking.setWalkerId(request.getWalkerId());
        booking.setPetId(request.getPetId());
        booking.setDate(request.getDate());
        booking.setDuration(request.getDuration());
        booking.setTotalPrice(totalPrice);
        booking.setNotes(request.getNotes());
        booking.setIsRegularPackage(request.getIsRegularPackage());
        booking.setPackageFrequency(request.getPackageFrequency());
        booking.setBookingMethod(WalkBooking.BookingMethod.WALKER_SELECTION);
        booking.setPickupLocation(request.getPickupLocation());
        booking.setPickupAddress(request.getPickupAddress());
        booking.setDropoffLocation(request.getDropoffLocation());
        booking.setDropoffAddress(request.getDropoffAddress());
        booking.setInsuranceCovered(true);
        booking.setStatus(WalkBooking.BookingStatus.PENDING);

        WalkBooking savedBooking = walkBookingRepository.save(booking);
        return WalkBookingResponse.from(savedBooking);
    }

    public List<WalkBookingResponse> getDirectBookingsByUser(Long userId) {
        User user = walkBookingService.findUserById(userId);

        List<WalkBooking> bookings = walkBookingRepository.findByUserIdOrderByDateDesc(user.getId());
        return bookings.stream()
                .filter(booking -> booking.getBookingMethod() == WalkBooking.BookingMethod.WALKER_SELECTION)
                .map(WalkBookingResponse::from)
                .collect(Collectors.toList());
    }

    public List<WalkBookingResponse> getDirectBookingsByWalker(Long userId) {
        User user = walkBookingService.findUserById(userId);
        Walker walker = walkBookingService.findWalkerById(user.getId());

        List<WalkBooking> bookings = walkBookingRepository.findByWalkerIdOrderByDateDesc(walker.getId());
        return bookings.stream()
                .filter(booking -> booking.getBookingMethod() == WalkBooking.BookingMethod.WALKER_SELECTION)
                .map(WalkBookingResponse::from)
                .collect(Collectors.toList());
    }

    public WalkBookingResponse getDirectBooking(Long bookingId, Long userId) {
        ValidationService.UserBookingValidation validation = validationService.validateUserBooking(bookingId, userId);

        // Verify this is a direct booking
        if (validation.booking.getBookingMethod() != WalkBooking.BookingMethod.WALKER_SELECTION) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "This is not a direct booking");
        }

        return WalkBookingResponse.from(validation.booking);
    }


    @Transactional
    public WalkBookingResponse updateBookingStatus(Long bookingId, WalkBooking.BookingStatus status, Long userId) {
        ValidationService.UserBookingValidation validation = validationService.validateUserBooking(bookingId, userId);

        // Verify this is a direct booking
        if (validation.booking.getBookingMethod() != WalkBooking.BookingMethod.WALKER_SELECTION) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "This method only handles direct bookings");
        }

        // Only walker can update status to CONFIRMED
        // Only user can CANCEL
        if (status == WalkBooking.BookingStatus.CANCELLED) {
            if (!validation.booking.getUserId().equals(validation.user.getId())) {
                throw new CustomException(ErrorCode.NO_ACCESS, "Only the booking user can cancel");
            }
        } else if (status == WalkBooking.BookingStatus.CONFIRMED) {
            // Check if user is the walker
            Walker walker = walkBookingService.findWalkerByUserId(validation.user.getId());
            if (walker == null || !validation.booking.getWalkerId().equals(walker.getId())) {
                throw new CustomException(ErrorCode.NO_ACCESS, "Only the assigned walker can confirm booking");
            }
        } else {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid status. Use WalkingService for walk status changes");
        }

        validation.booking.setStatus(status);

        WalkBooking updatedBooking = walkBookingRepository.save(validation.booking);

        if (status == WalkBooking.BookingStatus.CONFIRMED) {
            walkBookingService.createBookingChatRoomAndSendSystemMessage(updatedBooking);
        }

        return WalkBookingResponse.from(updatedBooking);
    }

    @Transactional
    public WalkBookingResponse cancelBooking(Long bookingId, Long userId) {
        return updateBookingStatus(bookingId, WalkBooking.BookingStatus.CANCELLED, userId);
    }
}
