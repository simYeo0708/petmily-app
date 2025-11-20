package com.petmily.backend.api.walk.service.validation;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walker.entity.Walker;
import com.petmily.backend.domain.walk.repository.WalkBookingRepository;
import com.petmily.backend.domain.walker.repository.WalkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ValidationService {

    private final UserRepository userRepository;
    private final WalkBookingRepository walkBookingRepository;
    private final WalkerRepository walkerRepository;

    public WalkBookingValidation validateWalkBooking(Long bookingId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkBooking booking = walkBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        Walker walker = walkerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NO_ACCESS, "Only walkers can perform this action"));

        if (!booking.getWalkerId().equals(walker.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only the assigned walker can perform this action");
        }

        return new WalkBookingValidation(user, booking, walker);
    }

    public UserBookingValidation validateUserBooking(Long bookingId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkBooking booking = walkBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        if (!hasAccessToBooking(booking, user)) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        return new UserBookingValidation(user, booking);
    }

    private boolean hasAccessToBooking(WalkBooking booking, User user) {
        if (booking.getUserId().equals(user.getId())) {
            return true;
        }

        Walker walker = walkerRepository.findByUserId(user.getId()).orElse(null);
        return walker != null && booking.getWalkerId().equals(walker.getId());
    }

    public static class WalkBookingValidation {
        public final User user;
        public final WalkBooking booking;
        public final Walker walker;

        public WalkBookingValidation(User user, WalkBooking booking, Walker walker) {
            this.user = user;
            this.booking = booking;
            this.walker = walker;
        }
    }

    public static class UserBookingValidation {
        public final User user;
        public final WalkBooking booking;

        public UserBookingValidation(User user, WalkBooking booking) {
            this.user = user;
            this.booking = booking;
        }
    }
}