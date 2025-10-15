package com.petmily.backend.api.walk.service.booking;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.walk.dto.booking.request.WalkApplicationRequest;
import com.petmily.backend.api.walk.dto.booking.request.WalkBookingRequest;
import com.petmily.backend.api.walk.dto.booking.response.WalkApplicationResponse;
import com.petmily.backend.api.walk.dto.booking.response.WalkBookingResponse;
import com.petmily.backend.api.walk.service.validation.ValidationService;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walk.repository.WalkBookingRepository;
import com.petmily.backend.domain.walker.entity.Walker;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import com.petmily.backend.domain.walker.repository.WalkerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenBookingService {

    private final WalkBookingRepository walkBookingRepository;
    private final WalkerRepository walkerRepository;
    private final UserRepository userRepository;
    private final WalkBookingService walkBookingService;
    private final ValidationService validationService;

    @Transactional
    public WalkBookingResponse createOpenBooking(Long userId, WalkBookingRequest request) {
        User user = walkBookingService.findUserById(userId);

        if (request.getPickupLocation() == null || request.getPickupAddress() == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Pickup location and address are required for open booking");
        }

        double estimatedPrice = 20000.0 * (request.getDuration() / 60.0); // 기본 예상 가격

        WalkBooking booking = new WalkBooking();
        booking.setUserId(user.getId());
        booking.setWalkerId(0L); // 아직 워커가 정해지지 않음
        booking.setPetId(request.getPetId());
        booking.setDate(request.getDate());
        booking.setDuration(request.getDuration());
        booking.setTotalPrice(estimatedPrice);
        booking.setNotes(request.getNotes());
        booking.setIsRegularPackage(request.getIsRegularPackage());
        booking.setPackageFrequency(request.getPackageFrequency());
        booking.setBookingMethod(WalkBooking.BookingMethod.OPEN_REQUEST);
        booking.setPickupLocation(request.getPickupLocation());
        booking.setPickupAddress(request.getPickupAddress());
        booking.setDropoffLocation(request.getDropoffLocation());
        booking.setDropoffAddress(request.getDropoffAddress());
        booking.setInsuranceCovered(true);
        booking.setStatus(WalkBooking.BookingStatus.PENDING); // 워커들의 지원을 기다림

        WalkBooking savedBooking = walkBookingRepository.save(booking);
        return WalkBookingResponse.from(savedBooking);
    }

    public List<WalkBookingResponse> getOpenBookings() {
        List<WalkBooking> openBookings = walkBookingRepository.findByBookingMethodAndStatusOrderByCreateTimeDesc(
                WalkBooking.BookingMethod.OPEN_REQUEST,
                WalkBooking.BookingStatus.PENDING
        );
        return openBookings.stream()
                .map(WalkBookingResponse::from)
                .collect(Collectors.toList());
    }

    public WalkBookingResponse getOpenBooking(Long bookingId, Long userId) {
        ValidationService.UserBookingValidation validation = validationService.validateUserBooking(bookingId, userId);

        if (validation.booking.getBookingMethod() != WalkBooking.BookingMethod.OPEN_REQUEST) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "This is not an open booking");
        }

        return WalkBookingResponse.from(validation.booking);
    }

    public List<WalkBookingResponse> getOpenBookingsByUser(Long userId) {
        User user = walkBookingService.findUserById(userId);

        List<WalkBooking> bookings = walkBookingRepository.findByUserIdOrderByDateDesc(user.getId());
        return bookings.stream()
                .filter(booking -> booking.getBookingMethod() == WalkBooking.BookingMethod.OPEN_REQUEST)
                .map(WalkBookingResponse::from)
                .collect(Collectors.toList());
    }

    public List<WalkApplicationResponse> getApplicationsByUser(Long openBookingId, Long userId) {
        User user = walkBookingService.findUserById(userId);
        WalkBooking openBooking = walkBookingRepository.findById(openBookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "OpenBooking not found"));

        if (!openBooking.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only the booking owner can view applications");
        }

        List<WalkBooking> applications = walkBookingRepository.findByUserIdAndBookingMethodAndStatusOrderByCreateTimeDesc(
                user.getId(), WalkBooking.BookingMethod.OPEN_REQUEST, WalkBooking.BookingStatus.WALKER_APPLIED);

        return applications.stream()
                .map(application -> {
                    Walker walker = walkerRepository.findById(application.getWalkerId()).orElse(null);
                    if (walker == null) return null;

                    User walkerUser = userRepository.findById(walker.getUserId()).orElse(null);
                    String walkerName = walkerUser != null ? walkerUser.getName() : "Unknown";

                    return WalkApplicationResponse.from(application, walkerName,
                            walker.getProfileImageUrl(), walker.getRating(), walker.getDetailDescription());
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }


    public List<WalkBookingResponse> getApplicationsByWalker(Long userId) {
        User user = walkBookingService.findUserById(userId);
        Walker walker = walkBookingService.findWalkerByUserId(user.getId());

        if (walker == null) {
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found");
        }

        List<WalkBooking> applications = walkBookingRepository.findByWalkerIdOrderByDateDesc(walker.getId());
        return applications.stream()
                .filter(booking -> booking.getBookingMethod() == WalkBooking.BookingMethod.OPEN_REQUEST)
                .map(WalkBookingResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public WalkBookingResponse applyToOpenBooking(Long openBookingId, WalkApplicationRequest request, Long userId) {
        User user = walkBookingService.findUserById(userId);
        Walker walker = walkBookingService.findWalkerByUserId(user.getId());

        if (walker == null) {
            throw new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker not found");
        }

        if (walker.getStatus() != WalkerStatus.ACTIVE) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Walker is not currently available");
        }

        WalkBooking openBooking = walkBookingService.findWalkBookingById(openBookingId);

        if (openBooking.getBookingMethod() != WalkBooking.BookingMethod.OPEN_REQUEST) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "This is not an open booking");
        }

        if (openBooking.getStatus() != WalkBooking.BookingStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "This open booking is no longer available");
        }

        boolean alreadyApplied = walkBookingRepository.existsByUserIdAndWalkerIdAndStatus(
                openBooking.getUserId(), walker.getId(), WalkBooking.BookingStatus.WALKER_APPLIED);

        if (alreadyApplied) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Already applied to this booking");
        }

        WalkBooking application = new WalkBooking();
        application.setUserId(openBooking.getUserId());
        application.setWalkerId(walker.getId());
        application.setPetId(openBooking.getPetId());
        application.setDate(openBooking.getDate());
        application.setDuration(openBooking.getDuration());
        application.setTotalPrice(request.getProposedPrice() != null ? request.getProposedPrice() : openBooking.getTotalPrice());
        application.setNotes(request.getMessage());
        application.setIsRegularPackage(openBooking.getIsRegularPackage());
        application.setPackageFrequency(openBooking.getPackageFrequency());
        application.setBookingMethod(WalkBooking.BookingMethod.OPEN_REQUEST);
        application.setPickupLocation(openBooking.getPickupLocation());
        application.setPickupAddress(openBooking.getPickupAddress());
        application.setDropoffLocation(openBooking.getDropoffLocation());
        application.setDropoffAddress(openBooking.getDropoffAddress());
        application.setInsuranceCovered(true);
        application.setStatus(WalkBooking.BookingStatus.WALKER_APPLIED);

        WalkBooking savedApplication = walkBookingRepository.save(application);
        return WalkBookingResponse.from(savedApplication);
    }

    @Transactional
    public WalkBookingResponse updateApplicationStatus(Long applicationId, WalkBooking.BookingStatus status, Long userId) {
        User user = walkBookingService.findUserById(userId);
        WalkBooking application = walkBookingRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Application not found"));

        // WALKER_APPLIED 상태의 지원만 수정 가능
        if (application.getStatus() != WalkBooking.BookingStatus.WALKER_APPLIED) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only modify pending applications");
        }

        Walker walker = walkBookingService.findWalkerByUserId(user.getId());
        boolean isWalker = walker != null && application.getWalkerId().equals(walker.getId());
        boolean isBookingOwner = application.getUserId().equals(user.getId());

        if (!isWalker && !isBookingOwner) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only the walker or booking owner can modify this application");
        }

        // 워커인 경우: CANCELLED만 가능
        if (isWalker && status != WalkBooking.BookingStatus.CANCELLED) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Walkers can only cancel their applications");
        }

        // 예약자인 경우: CONFIRMED 또는 REJECTED만 가능
        if (isBookingOwner && status != WalkBooking.BookingStatus.CONFIRMED && status != WalkBooking.BookingStatus.REJECTED) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Booking owner can only confirm or reject applications");
        }

        application.setStatus(status);

        // 사용자가 CONFIRMED로 변경한 경우, 다른 지원들은 모두 REJECTED
        if (status == WalkBooking.BookingStatus.CONFIRMED && isBookingOwner) {
            List<WalkBooking> otherApplications = walkBookingRepository.findByUserIdAndBookingMethodAndStatus(
                    user.getId(), WalkBooking.BookingMethod.OPEN_REQUEST, WalkBooking.BookingStatus.WALKER_APPLIED);

            otherApplications.stream()
                    .filter(app -> !app.getId().equals(applicationId))
                    .forEach(app -> {
                        app.setStatus(WalkBooking.BookingStatus.REJECTED);
                        walkBookingRepository.save(app);
                    });
        }

        WalkBooking updatedApplication = walkBookingRepository.save(application);

        // 수락된 경우 채팅방 생성
        if (status == WalkBooking.BookingStatus.CONFIRMED) {
            walkBookingService.createBookingChatRoomAndSendSystemMessage(updatedApplication);
        }

        return WalkBookingResponse.from(updatedApplication);
    }
}
