package com.petmily.backend.api.walk.service.booking;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.walk.dto.booking.request.BookingChangeRequestDto;
import com.petmily.backend.api.walk.dto.booking.request.ChangeRequestDecisionRequest;
import com.petmily.backend.api.walk.dto.booking.response.BookingChangeResponse;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import com.petmily.backend.domain.walker.entity.Walker;
import com.petmily.backend.domain.walk.repository.WalkBookingRepository;
import com.petmily.backend.domain.walker.repository.WalkerRepository;
import com.petmily.backend.domain.walk.entity.BookingChangeRequest;
import com.petmily.backend.domain.walk.repository.BookingChangeRequestRepository;
import com.petmily.backend.api.chat.service.ChatMessageService;
import com.petmily.backend.api.chat.service.ChatRoomService;
import com.petmily.backend.api.fcm.dto.FcmSendDto;
import com.petmily.backend.api.fcm.service.FcmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalkBookingService {

    private final WalkBookingRepository walkBookingRepository;
    private final WalkerRepository walkerRepository;
    private final UserRepository userRepository;
    private final BookingChangeRequestRepository bookingChangeRequestRepository;
    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;
    private final FcmService fcmService;

    public User findUserById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    public Walker findWalkerById(Long walkerId){
        return walkerRepository.findById(walkerId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Walker not found"));
    }

    public Walker findWalkerByUserId(Long userId){
        return walkerRepository.findByUserId(userId).orElse(null);
    }

    public WalkBooking findWalkBookingById(Long bookingId){
        return walkBookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found"));
    }

    /**
     * 예약 확정 시 자동으로 채팅방 생성 및 예약 상세 시스템 메시지 발송
     */
    public void createBookingChatRoomAndSendSystemMessage(WalkBooking booking) {
        try {
            var chatRoomResponse = chatRoomService.createPostBookingChatRoom(
                    booking.getUserId(),
                    booking.getWalkerId(),
                    booking.getId()
            );

            chatMessageService.createBookingSystemMessage(chatRoomResponse.getId(), booking);

            // 예약 확정 FCM 푸시 알림 발송
            try {
                User user = findUserById(booking.getUserId());
                if (user != null && user.getFcmToken() != null && !user.getFcmToken().isEmpty()) {
                    FcmSendDto fcmDto = FcmSendDto.builder()
                            .token(user.getFcmToken())
                            .title("산책 예약이 확정되었습니다")
                            .body(String.format("산책 예약이 확정되었습니다. 워커와 채팅을 시작할 수 있습니다."))
                            .build();
                    fcmService.sendMessageTo(fcmDto);
                    log.info("예약 확정 FCM 푸시 알림 발송 완료 - Booking ID: {}", booking.getId());
                }
            } catch (Exception e) {
                log.warn("예약 확정 FCM 푸시 알림 발송 실패 - Booking ID: {}", booking.getId(), e);
            }

            log.info("예약 확정으로 인한 채팅방 생성 완료 - Booking ID: {}, Chat Room ID: {}",
                    booking.getId(), chatRoomResponse.getRoomId());

        } catch (Exception e) {
            log.error("예약 확정 시 채팅방 생성 중 오류 발생 - Booking ID: {}", booking.getId(), e);
        }
    }

    @Transactional
    public BookingChangeResponse requestBookingChange(Long bookingId, BookingChangeRequestDto request, Long userId) {
        User user = findUserById(userId);
        WalkBooking booking = findWalkBookingById(bookingId);

        // 예약자 또는 워커만 변경 요청 가능
        boolean isBookingOwner = booking.getUserId().equals(user.getId());
        boolean isAssignedWalker = false;

        Walker walker = findWalkerByUserId(user.getId());
        if (walker != null) {
            isAssignedWalker = booking.getWalkerId().equals(walker.getId());
        }

        if (!isBookingOwner && !isAssignedWalker) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only booking owner or assigned walker can request changes");
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
                .changeReason(request.getChangeReason())
                .status(BookingChangeRequest.ChangeRequestStatus.PENDING)
                .build();

        BookingChangeRequest savedRequest = bookingChangeRequestRepository.save(changeRequest);
        return BookingChangeResponse.from(savedRequest);
    }

    @Transactional
    public BookingChangeResponse respondToChangeRequest(Long requestId, ChangeRequestDecisionRequest decision, Long userId) {
        User user = findUserById(userId);
        BookingChangeRequest changeRequest = bookingChangeRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(ErrorCode.RESOURCE_NOT_FOUND, "Change request not found"));
        WalkBooking booking = findWalkBookingById(changeRequest.getBookingId());

        // 변경 요청을 받은 사람만 응답 가능
        // 1. 사용자가 요청했으면 → 워커가 응답
        // 2. 워커가 요청했으면 → 사용자가 응답
        boolean canRespond = false;

        // 사용자가 응답하는 경우 (워커가 요청한 경우)
        if (booking.getUserId().equals(user.getId()) && !changeRequest.getRequestedByUserId().equals(user.getId())) {
            canRespond = true;
        }

        // 워커가 응답하는 경우 (사용자가 요청한 경우)
        Walker walker = findWalkerByUserId(user.getId());
        if (walker != null && booking.getWalkerId().equals(walker.getId()) && !changeRequest.getRequestedByUserId().equals(user.getId())) {
            canRespond = true;
        }

        if (!canRespond) {
            throw new CustomException(ErrorCode.NO_ACCESS, "Only the recipient can respond to change requests");
        }

        if (changeRequest.getStatus() != BookingChangeRequest.ChangeRequestStatus.PENDING) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Change request already processed");
        }

        changeRequest.setStatus(decision.getDecision());
        changeRequest.setChangeResponse(decision.getResponse());
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
    }

    public List<BookingChangeResponse> getBookingChangeRequests(Long bookingId, Long userId) {
        User user = findUserById(userId);
        WalkBooking booking = findWalkBookingById(bookingId);

        boolean hasAccess = booking.getUserId().equals(user.getId());
        if (!hasAccess) {
            Walker walker = findWalkerByUserId(user.getId());
            hasAccess = walker != null && booking.getWalkerId().equals(walker.getId());
        }

        if (!hasAccess) {
            throw new CustomException(ErrorCode.NO_ACCESS, "No access to this booking's change requests");
        }

        List<BookingChangeRequest> requests = bookingChangeRequestRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
        return requests.stream()
                .map(BookingChangeResponse::from)
                .collect(Collectors.toList());
    }

    public List<BookingChangeResponse> getPendingChangeRequests(Long userId) {
        User user = findUserById(userId);
        List<BookingChangeRequest> requests = new ArrayList<>();

        // 1. 내가 요청한 PENDING 변경 요청
        List<BookingChangeRequest> sentRequests = bookingChangeRequestRepository
                .findByRequestedByUserIdAndStatusOrderByCreatedAtDesc(
                        user.getId(), BookingChangeRequest.ChangeRequestStatus.PENDING);
        requests.addAll(sentRequests);

        // 2. 내가 예약자(사용자)인 예약의 PENDING 변경 요청 (워커가 보낸 요청)
        List<BookingChangeRequest> receivedAsUser = bookingChangeRequestRepository
                .findByBooking_UserIdAndStatusOrderByCreatedAtDesc(
                        user.getId(), BookingChangeRequest.ChangeRequestStatus.PENDING);
        // 내가 보낸 요청은 제외 (중복 방지)
        receivedAsUser.removeIf(req -> req.getRequestedByUserId().equals(user.getId()));
        requests.addAll(receivedAsUser);

        // 3. 워커라면, 워커로서 받은 PENDING 변경 요청도 포함
        walkerRepository.findByUserId(user.getId()).ifPresent(walker -> {
            List<BookingChangeRequest> receivedAsWalker = bookingChangeRequestRepository
                    .findByBooking_WalkerIdAndStatusOrderByCreatedAtDesc(
                            walker.getId(), BookingChangeRequest.ChangeRequestStatus.PENDING);
            // 내가 보낸 요청은 제외 (중복 방지)
            receivedAsWalker.removeIf(req -> req.getRequestedByUserId().equals(user.getId()));
            requests.addAll(receivedAsWalker);
        });

        return requests.stream()
                .map(BookingChangeResponse::from)
                .collect(Collectors.toList());
    }

}