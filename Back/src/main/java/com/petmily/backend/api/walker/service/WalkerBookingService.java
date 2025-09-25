package com.petmily.backend.api.walker.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.walker.dto.walkerBooking.*;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walker.entity.BookingChangeRequest;
import com.petmily.backend.domain.walker.repository.WalkerBookingRepository;
import com.petmily.backend.domain.walker.repository.WalkerProfileRepository;
import com.petmily.backend.domain.walker.repository.BookingChangeRequestRepository;
import com.petmily.backend.api.chat.service.ChatRoomService;
import com.petmily.backend.api.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalkerBookingService {

    private final WalkerBookingRepository walkerBookingRepository;
    private final WalkerProfileRepository walkerProfileRepository;
    private final UserRepository userRepository;
    private final BookingChangeRequestRepository bookingChangeRequestRepository;
    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;

    @Transactional
    public WalkerBookingResponse createBooking(Long userId, WalkerBookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (request.getBookingMethod() == WalkerBooking.BookingMethod.WALKER_SELECTION) {
            return createWalkerSelectionBooking(user, request);
        } else {
            return createOpenRequestBooking(user, request);
        }
    }

    private WalkerBookingResponse createWalkerSelectionBooking(User user, WalkerBookingRequest request) {
        if (request.getWalkerId() == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Walker ID is required for walker selection booking");
        }

        WalkerProfile walker = walkerProfileRepository.findById(request.getWalkerId())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found"));

        if (!walker.getIsAvailable() || walker.getStatus() != WalkerStatus.ACTIVE) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Walker is not currently available");
        }

        double hourlyRate = walker.getHourlyRate() != null ? walker.getHourlyRate() : 20000.0;
        double totalPrice = hourlyRate * (request.getDuration() / 60.0);

        WalkerBooking booking = new WalkerBooking();
        booking.setUserId(user.getId());
        booking.setWalkerId(request.getWalkerId());
        booking.setPetId(request.getPetId());
        booking.setDate(request.getDate());
        booking.setDuration(request.getDuration());
        booking.setTotalPrice(totalPrice);
        booking.setNotes(request.getNotes());
        booking.setEmergencyContact(request.getEmergencyContact());
        booking.setIsRegularPackage(request.getIsRegularPackage());
        booking.setPackageFrequency(request.getPackageFrequency());
        booking.setBookingMethod(WalkerBooking.BookingMethod.WALKER_SELECTION);
        booking.setPickupLocation(request.getPickupLocation());
        booking.setPickupAddress(request.getPickupAddress());
        booking.setDropoffLocation(request.getDropoffLocation());
        booking.setDropoffAddress(request.getDropoffAddress());
        booking.setInsuranceCovered(true);
        booking.setStatus(WalkerBooking.BookingStatus.PENDING);

        WalkerBooking savedBooking = walkerBookingRepository.save(booking);
        return WalkerBookingResponse.from(savedBooking);
    }

    private WalkerBookingResponse createOpenRequestBooking(User user, WalkerBookingRequest request) {
        if (request.getPickupLocation() == null || request.getPickupAddress() == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Pickup location and address are required for open request");
        }

        double estimatedPrice = 20000.0 * (request.getDuration() / 60.0); // 기본 예상 가격

        WalkerBooking booking = new WalkerBooking();
        booking.setUserId(user.getId());
        booking.setWalkerId(0L); // 아직 워커가 정해지지 않음
        booking.setPetId(request.getPetId());
        booking.setDate(request.getDate());
        booking.setDuration(request.getDuration());
        booking.setTotalPrice(estimatedPrice);
        booking.setNotes(request.getNotes());
        booking.setEmergencyContact(request.getEmergencyContact());
        booking.setIsRegularPackage(request.getIsRegularPackage());
        booking.setPackageFrequency(request.getPackageFrequency());
        booking.setBookingMethod(WalkerBooking.BookingMethod.OPEN_REQUEST);
        booking.setPickupLocation(request.getPickupLocation());
        booking.setPickupAddress(request.getPickupAddress());
        booking.setDropoffLocation(request.getDropoffLocation());
        booking.setDropoffAddress(request.getDropoffAddress());
        booking.setInsuranceCovered(true);
        booking.setStatus(WalkerBooking.BookingStatus.PENDING); // 워커들의 지원을 기다림

        WalkerBooking savedBooking = walkerBookingRepository.save(booking);
        return WalkerBookingResponse.from(savedBooking);
    }

    public List<WalkerBookingResponse> getUserBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<WalkerBooking> bookings = walkerBookingRepository.findByUserIdOrderByDateDesc(user.getId());
        return bookings.stream()
                .map(WalkerBookingResponse::from)
                .collect(Collectors.toList());
    }

    public List<WalkerBookingResponse> getWalkerBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found"));

        List<WalkerBooking> bookings = walkerBookingRepository.findByWalkerIdOrderByDateDesc(walker.getId());
        return bookings.stream()
                .map(WalkerBookingResponse::from)
                .collect(Collectors.toList());
    }

    public WalkerBookingResponse getBooking(Long bookingId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerBooking booking = walkerBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        // Check if user has permission to view this booking
        if (!booking.getUserId().equals(user.getId())) {
            // Check if user is the walker
            WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId()).orElse(null);
            if (walker == null || !booking.getWalkerId().equals(walker.getId())) {
                throw new CustomException(ErrorCode.NO_ACCESS);
            }
        }

        return WalkerBookingResponse.from(booking);
    }

    @Transactional
    public WalkerBookingResponse updateBookingStatus(Long bookingId, WalkerBooking.BookingStatus status, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerBooking booking = walkerBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        // Only walker can update status to CONFIRMED
        // Only user can CANCEL
        if (status == WalkerBooking.BookingStatus.CANCELLED) {
            if (!booking.getUserId().equals(user.getId())) {
                throw new CustomException(ErrorCode.NO_ACCESS, "Only the booking user can cancel");
            }
        } else if (status == WalkerBooking.BookingStatus.CONFIRMED) {
            // Check if user is the walker
            WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId())
                    .orElse(null);
            if (walker == null || !booking.getWalkerId().equals(walker.getId())) {
                throw new CustomException(ErrorCode.NO_ACCESS, "Only the assigned walker can confirm booking");
            }
        } else {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid status. Use WalkingService for walk status changes");
        }

        booking.setStatus(status);

        WalkerBooking updatedBooking = walkerBookingRepository.save(booking);
        
        if (status == WalkerBooking.BookingStatus.CONFIRMED) {
            createBookingChatRoomAndSendSystemMessage(updatedBooking);
        }
        
        return WalkerBookingResponse.from(updatedBooking);
    }



    @Transactional
    public WalkerBookingResponse cancelBooking(Long bookingId, Long userId) {
        return updateBookingStatus(bookingId, WalkerBooking.BookingStatus.CANCELLED, userId);
    }


    public List<WalkerBookingResponse> getOpenRequests() {
        List<WalkerBooking> openRequests = walkerBookingRepository.findByBookingMethodAndStatusOrderByCreateTimeDesc(
                WalkerBooking.BookingMethod.OPEN_REQUEST, 
                WalkerBooking.BookingStatus.PENDING
        );
        return openRequests.stream()
                .map(WalkerBookingResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public WalkerBookingResponse applyToOpenRequest(Long openRequestId, WalkerApplicationRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NO_ACCESS, "Only walkers can apply to open requests"));

        if (!walker.getIsAvailable() || walker.getStatus() != WalkerStatus.ACTIVE) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Walker is not currently available");
        }

        WalkerBooking openRequest = walkerBookingRepository.findById(openRequestId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Open request not found"));

        if (openRequest.getBookingMethod() != WalkerBooking.BookingMethod.OPEN_REQUEST) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "This is not an open request");
        }

        if (openRequest.getStatus() != WalkerBooking.BookingStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "This open request is no longer available");
        }

        boolean alreadyApplied = walkerBookingRepository.existsByUserIdAndWalkerIdAndStatus(
                openRequest.getUserId(), walker.getId(), WalkerBooking.BookingStatus.WALKER_APPLIED);
        
        if (alreadyApplied) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Already applied to this request");
        }

        WalkerBooking application = new WalkerBooking();
        application.setUserId(openRequest.getUserId());
        application.setWalkerId(walker.getId());
        application.setPetId(openRequest.getPetId());
        application.setDate(openRequest.getDate());
        application.setDuration(openRequest.getDuration());
        application.setTotalPrice(request.getProposedPrice() != null ? request.getProposedPrice() : openRequest.getTotalPrice());
        application.setNotes(request.getMessage());
        application.setEmergencyContact(openRequest.getEmergencyContact());
        application.setIsRegularPackage(openRequest.getIsRegularPackage());
        application.setPackageFrequency(openRequest.getPackageFrequency());
        application.setBookingMethod(WalkerBooking.BookingMethod.OPEN_REQUEST);
        application.setPickupLocation(openRequest.getPickupLocation());
        application.setPickupAddress(openRequest.getPickupAddress());
        application.setDropoffLocation(openRequest.getDropoffLocation());
        application.setDropoffAddress(openRequest.getDropoffAddress());
        application.setInsuranceCovered(true);
        application.setStatus(WalkerBooking.BookingStatus.WALKER_APPLIED);

        WalkerBooking savedApplication = walkerBookingRepository.save(application);
        return WalkerBookingResponse.from(savedApplication);
    }

    public List<WalkerApplicationResponse> getWalkerApplications(Long openRequestId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerBooking openRequest = walkerBookingRepository.findById(openRequestId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Open request not found"));

        if (!openRequest.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only the request owner can view applications");
        }

        List<WalkerBooking> applications = walkerBookingRepository.findByUserIdAndBookingMethodAndStatusOrderByCreateTimeDesc(
                user.getId(), WalkerBooking.BookingMethod.OPEN_REQUEST, WalkerBooking.BookingStatus.WALKER_APPLIED);

        return applications.stream()
                .map(application -> {
                    WalkerProfile walker = walkerProfileRepository.findById(application.getWalkerId()).orElse(null);
                    if (walker == null) return null;
                    
                    User walkerUser = userRepository.findById(walker.getUserId()).orElse(null);
                    String walkerName = walkerUser != null ? walkerUser.getName() : "Unknown";
                    
                    return WalkerApplicationResponse.from(application, walkerName, 
                            walker.getProfileImageUrl(), walker.getRating(), walker.getExperience());
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }

    @Transactional
    public WalkerBookingResponse respondToWalkerApplication(Long applicationId, boolean accept, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerBooking application = walkerBookingRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Application not found"));

        if (!application.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only the request owner can respond to applications");
        }

        if (application.getStatus() != WalkerBooking.BookingStatus.WALKER_APPLIED) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid application status");
        }

        if (accept) {
            application.setStatus(WalkerBooking.BookingStatus.CONFIRMED);
            
            List<WalkerBooking> otherApplications = walkerBookingRepository.findByUserIdAndBookingMethodAndStatus(
                    user.getId(), WalkerBooking.BookingMethod.OPEN_REQUEST, WalkerBooking.BookingStatus.WALKER_APPLIED);
            
            otherApplications.stream()
                    .filter(app -> !app.getId().equals(applicationId))
                    .forEach(app -> {
                        app.setStatus(WalkerBooking.BookingStatus.REJECTED);
                        walkerBookingRepository.save(app);
                    });
        } else {
            application.setStatus(WalkerBooking.BookingStatus.REJECTED);
        }

        WalkerBooking updatedApplication = walkerBookingRepository.save(application);
        
        if (accept) {
            createBookingChatRoomAndSendSystemMessage(updatedApplication);
        }
        
        return WalkerBookingResponse.from(updatedApplication);
    }

    @Transactional
    public BookingChangeResponse requestBookingChange(Long bookingId, com.petmily.backend.api.walker.dto.walkerBooking.BookingChangeRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerBooking booking = walkerBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only booking owner can request changes");
        }

        if (booking.getStatus() != WalkerBooking.BookingStatus.CONFIRMED) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only request changes for confirmed bookings");
        }

        com.petmily.backend.domain.walker.entity.BookingChangeRequest changeRequest = com.petmily.backend.domain.walker.entity.BookingChangeRequest.builder()
                .bookingId(bookingId)
                .requestedByUserId(user.getId())
                .newDate(request.getNewDate())
                .newDuration(request.getNewDuration())
                .newPrice(request.getNewPrice())
                .newPickupLocation(request.getNewPickupLocation())
                .newPickupAddress(request.getNewPickupAddress())
                .newDropoffLocation(request.getNewDropoffLocation())
                .newDropoffAddress(request.getNewDropoffAddress())
                .newNotes(request.getNewNotes())
                .newInsuranceCovered(request.getNewInsuranceCovered())
                .newEmergencyContact(request.getNewEmergencyContact())
                .changeReason(request.getChangeReason())
                .status(BookingChangeRequest.ChangeRequestStatus.PENDING)
                .build();

        BookingChangeRequest savedRequest = bookingChangeRequestRepository.save(changeRequest);
        return BookingChangeResponse.from(savedRequest);
    }

    @Transactional
    public BookingChangeResponse respondToChangeRequest(Long requestId, ChangeRequestDecisionRequest decision, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        BookingChangeRequest changeRequest = bookingChangeRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Change request not found"));

        WalkerBooking booking = walkerBookingRepository.findById(changeRequest.getBookingId())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId())
                .orElse(null);
        if (walker == null || !booking.getWalkerId().equals(walker.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only assigned walker can respond to change requests");
        }

        if (changeRequest.getStatus() != BookingChangeRequest.ChangeRequestStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Change request already processed");
        }

        changeRequest.setStatus(decision.getDecision());
        changeRequest.setWalkerResponse(decision.getResponse());
        changeRequest.setRespondedAt(LocalDateTime.now());

        if (decision.getDecision() == BookingChangeRequest.ChangeRequestStatus.APPROVED) {
            applyChangesToBooking(booking, changeRequest);
            walkerBookingRepository.save(booking);
        }

        BookingChangeRequest updatedRequest = bookingChangeRequestRepository.save(changeRequest);
        return BookingChangeResponse.from(updatedRequest);
    }

    private void applyChangesToBooking(WalkerBooking booking, BookingChangeRequest changeRequest) {
        if (changeRequest.getNewDate() != null) {
            booking.setDate(changeRequest.getNewDate());
        }
        if (changeRequest.getNewDuration() != null) {
            booking.setDuration(changeRequest.getNewDuration());
        }
        if (changeRequest.getNewPrice() != null) {
            booking.setTotalPrice(changeRequest.getNewPrice());
        }
        if (changeRequest.getNewPickupLocation() != null) {
            booking.setPickupLocation(changeRequest.getNewPickupLocation());
        }
        if (changeRequest.getNewPickupAddress() != null) {
            booking.setPickupAddress(changeRequest.getNewPickupAddress());
        }
        if (changeRequest.getNewDropoffLocation() != null) {
            booking.setDropoffLocation(changeRequest.getNewDropoffLocation());
        }
        if (changeRequest.getNewDropoffAddress() != null) {
            booking.setDropoffAddress(changeRequest.getNewDropoffAddress());
        }
        if (changeRequest.getNewNotes() != null) {
            booking.setNotes(changeRequest.getNewNotes());
        }
        if (changeRequest.getNewInsuranceCovered() != null) {
            booking.setInsuranceCovered(changeRequest.getNewInsuranceCovered());
        }
        if (changeRequest.getNewEmergencyContact() != null) {
            booking.setEmergencyContact(changeRequest.getNewEmergencyContact());
        }
    }

    public List<BookingChangeResponse> getBookingChangeRequests(Long bookingId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerBooking booking = walkerBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        boolean hasAccess = booking.getUserId().equals(user.getId());
        if (!hasAccess) {
            WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId()).orElse(null);
            hasAccess = walker != null && booking.getWalkerId().equals(walker.getId());
        }

        if (!hasAccess) {
            throw new CustomException(ErrorCode.NO_ACCESS, "No access to this booking's change requests");
        }

        List<BookingChangeRequest> requests = bookingChangeRequestRepository.findByBookingIdOrderByCreateTimeDesc(bookingId);
        return requests.stream()
                .map(BookingChangeResponse::from)
                .collect(Collectors.toList());
    }

    public List<BookingChangeResponse> getPendingChangeRequestsForWalker(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NO_ACCESS, "Walker profile not found"));

        List<BookingChangeRequest> requests = bookingChangeRequestRepository.findByBooking_WalkerIdAndStatusOrderByCreateTimeDesc(
                walker.getId(), BookingChangeRequest.ChangeRequestStatus.PENDING);

        return requests.stream()
                .map(BookingChangeResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 예약 확정 시 자동으로 채팅방 생성 및 예약 상세 시스템 메시지 발송
     */
    private void createBookingChatRoomAndSendSystemMessage(WalkerBooking booking) {
        try {
            var chatRoomResponse = chatRoomService.createPostBookingChatRoom(
                    booking.getUserId(),
                    booking.getWalkerId(),
                    booking.getId()
            );

            chatMessageService.createBookingSystemMessage(chatRoomResponse.getId(), booking);

            log.info("예약 확정으로 인한 채팅방 생성 완료 - Booking ID: {}, Chat Room ID: {}",
                    booking.getId(), chatRoomResponse.getRoomId());

        } catch (Exception e) {
            log.error("예약 확정 시 채팅방 생성 중 오류 발생 - Booking ID: {}", booking.getId(), e);
        }
    }
}