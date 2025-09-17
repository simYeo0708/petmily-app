package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walker.repository.WalkerBookingRepository;
import com.petmily.backend.domain.walker.repository.WalkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WalkingValidationService {

    private final UserRepository userRepository;
    private final WalkerBookingRepository walkerBookingRepository;
    private final WalkerProfileRepository walkerProfileRepository;

    public WalkerBookingValidation validateWalkerBooking(Long bookingId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerBooking booking = walkerBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NO_ACCESS, "Only walkers can perform this action"));

        if (!booking.getWalkerId().equals(walker.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only the assigned walker can perform this action");
        }

        return new WalkerBookingValidation(user, booking, walker);
    }

    public UserBookingValidation validateUserBooking(Long bookingId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerBooking booking = walkerBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        if (!hasAccessToBooking(booking, user)) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        return new UserBookingValidation(user, booking);
    }

    private boolean hasAccessToBooking(WalkerBooking booking, User user) {
        if (booking.getUserId().equals(user.getId())) {
            return true;
        }
        
        WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId()).orElse(null);
        return walker != null && booking.getWalkerId().equals(walker.getId());
    }

    public static class WalkerBookingValidation {
        public final User user;
        public final WalkerBooking booking;
        public final WalkerProfile walker;

        public WalkerBookingValidation(User user, WalkerBooking booking, WalkerProfile walker) {
            this.user = user;
            this.booking = booking;
            this.walker = walker;
        }
    }

    public static class UserBookingValidation {
        public final User user;
        public final WalkerBooking booking;

        public UserBookingValidation(User user, WalkerBooking booking) {
            this.user = user;
            this.booking = booking;
        }
    }
}