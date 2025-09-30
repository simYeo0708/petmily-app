package com.petmily.backend.api.walk.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.walk.dto.booking.*;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walker.entity.WalkerProfile;
import com.petmily.backend.domain.walk.entity.BookingChangeRequest;
import com.petmily.backend.domain.walk.repository.WalkBookingRepository;
import com.petmily.backend.domain.walker.repository.WalkerProfileRepository;
import com.petmily.backend.domain.walk.repository.BookingChangeRequestRepository;
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
public class WalkBookingService {

    private final WalkBookingRepository walkBookingRepository;
    private final WalkerProfileRepository walkerProfileRepository;
    private final UserRepository userRepository;
    private final BookingChangeRequestRepository bookingChangeRequestRepository;
    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;

    @Transactional
    public WalkBookingResponse createBooking(Long userId, WalkBookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (request.getBookingMethod() == WalkBooking.BookingMethod.WALKER_SELECTION) {
            return createWalkerSelectionBooking(user, request);
        } else {
            return createOpenRequestBooking(user, request);
        }
    }

    private WalkBookingResponse createWalkerSelectionBooking(User user, WalkBookingRequest request) {
        if (request.getWalkerId() == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Walker ID is required for walker selection booking");
        }

        WalkerProfile walker = walkerProfileRepository.findById(request.getWalkerId())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found"));

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
        booking.setEmergencyContact(request.getEmergencyContact());
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

    private WalkBookingResponse createOpenRequestBooking(User user, WalkBookingRequest request) {
        if (request.getPickupLocation() == null || request.getPickupAddress() == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Pickup location and address are required for open request");
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
        booking.setEmergencyContact(request.getEmergencyContact());
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

    public List<WalkBookingResponse> getUserBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<WalkBooking> bookings = walkBookingRepository.findByUserIdOrderByDateDesc(user.getId());
        return bookings.stream()
                .map(WalkBookingResponse::from)
                .collect(Collectors.toList());
    }

    public List<WalkBookingResponse> getWalkerBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker profile not found"));

        List<WalkBooking> bookings = walkBookingRepository.findByWalkerIdOrderByDateDesc(walker.getId());
        return bookings.stream()
                .map(WalkBookingResponse::from)
                .collect(Collectors.toList());
    }

    public WalkBookingResponse getBooking(Long bookingId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkBooking booking = walkBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        // Check if user has permission to view this booking
        if (!booking.getUserId().equals(user.getId())) {
            // Check if user is the walker
            WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId()).orElse(null);
            if (walker == null || !booking.getWalkerId().equals(walker.getId())) {
                throw new CustomException(ErrorCode.NO_ACCESS);
            }
        }

        return WalkBookingResponse.from(booking);
    }

    @Transactional
    public WalkBookingResponse updateBookingStatus(Long bookingId, WalkBooking.BookingStatus status, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkBooking booking = walkBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        // Only walker can update status to CONFIRMED
        // Only user can CANCEL
        if (status == WalkBooking.BookingStatus.CANCELLED) {
            if (!booking.getUserId().equals(user.getId())) {
                throw new CustomException(ErrorCode.NO_ACCESS, "Only the booking user can cancel");
            }
        } else if (status == WalkBooking.BookingStatus.CONFIRMED) {
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

        WalkBooking updatedBooking = walkBookingRepository.save(booking);
        
        if (status == WalkBooking.BookingStatus.CONFIRMED) {
            createBookingChatRoomAndSendSystemMessage(updatedBooking);
        }
        
        return WalkBookingResponse.from(updatedBooking);
    }



    @Transactional
    public WalkBookingResponse cancelBooking(Long bookingId, Long userId) {
        return updateBookingStatus(bookingId, WalkBooking.BookingStatus.CANCELLED, userId);
    }


    public List<WalkBookingResponse> getOpenRequests() {
        List<WalkBooking> openRequests = walkBookingRepository.findByBookingMethodAndStatusOrderByCreateTimeDesc(
                WalkBooking.BookingMethod.OPEN_REQUEST, 
                WalkBooking.BookingStatus.PENDING
        );
        return openRequests.stream()
                .map(WalkBookingResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public WalkBookingResponse applyToOpenRequest(Long openRequestId, WalkApplicationRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkerProfile walker = walkerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NO_ACCESS, "Only walkers can apply to open requests"));

        if (walker.getStatus() != WalkerStatus.ACTIVE) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Walker is not currently available");
        }

        WalkBooking openRequest = walkBookingRepository.findById(openRequestId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Open request not found"));

        if (openRequest.getBookingMethod() != WalkBooking.BookingMethod.OPEN_REQUEST) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "This is not an open request");
        }

        if (openRequest.getStatus() != WalkBooking.BookingStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "This open request is no longer available");
        }

        boolean alreadyApplied = walkBookingRepository.existsByUserIdAndWalkerIdAndStatus(
                openRequest.getUserId(), walker.getId(), WalkBooking.BookingStatus.WALKER_APPLIED);
        
        if (alreadyApplied) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Already applied to this request");
        }

        WalkBooking application = new WalkBooking();
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
        application.setBookingMethod(WalkBooking.BookingMethod.OPEN_REQUEST);
        application.setPickupLocation(openRequest.getPickupLocation());
        application.setPickupAddress(openRequest.getPickupAddress());
        application.setDropoffLocation(openRequest.getDropoffLocation());
        application.setDropoffAddress(openRequest.getDropoffAddress());
        application.setInsuranceCovered(true);
        application.setStatus(WalkBooking.BookingStatus.WALKER_APPLIED);

        WalkBooking savedApplication = walkBookingRepository.save(application);
        return WalkBookingResponse.from(savedApplication);
    }

    public List<WalkApplicationResponse> getWalkerApplications(Long openRequestId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkBooking openRequest = walkBookingRepository.findById(openRequestId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Open request not found"));

        if (!openRequest.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only the request owner can view applications");
        }

        List<WalkBooking> applications = walkBookingRepository.findByUserIdAndBookingMethodAndStatusOrderByCreateTimeDesc(
                user.getId(), WalkBooking.BookingMethod.OPEN_REQUEST, WalkBooking.BookingStatus.WALKER_APPLIED);

        return applications.stream()
                .map(application -> {
                    WalkerProfile walker = walkerProfileRepository.findById(application.getWalkerId()).orElse(null);
                    if (walker == null) return null;
                    
                    User walkerUser = userRepository.findById(walker.getUserId()).orElse(null);
                    String walkerName = walkerUser != null ? walkerUser.getName() : "Unknown";
                    
                    return WalkApplicationResponse.from(application, walkerName, 
                            walker.getProfileImageUrl(), walker.getRating(), walker.getDetailDescription());
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }

    @Transactional
    public WalkBookingResponse respondToWalkerApplication(Long applicationId, boolean accept, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkBooking application = walkBookingRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Application not found"));

        if (!application.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only the request owner can respond to applications");
        }

        if (application.getStatus() != WalkBooking.BookingStatus.WALKER_APPLIED) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid application status");
        }

        if (accept) {
            application.setStatus(WalkBooking.BookingStatus.CONFIRMED);
            
            List<WalkBooking> otherApplications = walkBookingRepository.findByUserIdAndBookingMethodAndStatus(
                    user.getId(), WalkBooking.BookingMethod.OPEN_REQUEST, WalkBooking.BookingStatus.WALKER_APPLIED);
            
            otherApplications.stream()
                    .filter(app -> !app.getId().equals(applicationId))
                    .forEach(app -> {
                        app.setStatus(WalkBooking.BookingStatus.REJECTED);
                        walkBookingRepository.save(app);
                    });
        } else {
            application.setStatus(WalkBooking.BookingStatus.REJECTED);
        }

        WalkBooking updatedApplication = walkBookingRepository.save(application);
        
        if (accept) {
            createBookingChatRoomAndSendSystemMessage(updatedApplication);
        }
        
        return WalkBookingResponse.from(updatedApplication);
    }

    @Transactional
    public BookingChangeResponse requestBookingChange(Long bookingId, com.petmily.backend.api.walk.dto.booking.BookingChangeRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        WalkBooking booking = walkBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only booking owner can request changes");
        }

        if (booking.getStatus() != WalkBooking.BookingStatus.CONFIRMED) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Can only request changes for confirmed bookings");
        }

        BookingChangeRequest changeRequest = BookingChangeRequest.builder()
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

        WalkBooking booking = walkBookingRepository.findById(changeRequest.getBookingId())
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
            walkBookingRepository.save(booking);
        }

        BookingChangeRequest updatedRequest = bookingChangeRequestRepository.save(changeRequest);
        return BookingChangeResponse.from(updatedRequest);
    }

    private void applyChangesToBooking(WalkBooking booking, BookingChangeRequest changeRequest) {
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

        WalkBooking booking = walkBookingRepository.findById(bookingId)
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
    private void createBookingChatRoomAndSendSystemMessage(WalkBooking booking) {
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