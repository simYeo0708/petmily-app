package com.petmily.backend.api.walk.controller.booking;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.walk.dto.booking.request.BookingChangeRequestDto;
import com.petmily.backend.api.walk.dto.booking.request.ChangeRequestDecisionRequest;
import com.petmily.backend.api.walk.dto.booking.response.BookingChangeResponse;
import com.petmily.backend.api.walk.service.booking.WalkBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class WalkBookingController {

    private final WalkBookingService walkBookingService;

    /**
     * 예약 변경 요청 (사용자 또는 워커가 요청)
     */
    @PostMapping("/{bookingId}/change-requests")
    public ResponseEntity<BookingChangeResponse> requestBookingChange(
            @PathVariable Long bookingId,
            @RequestBody BookingChangeRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        BookingChangeResponse response = walkBookingService.requestBookingChange(bookingId, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 예약 변경 요청에 대한 응답 (요청 받은 사람이 응답)
     */
    @PutMapping("/change-requests/{requestId}/respond")
    public ResponseEntity<BookingChangeResponse> respondToChangeRequest(
            @PathVariable Long requestId,
            @RequestBody ChangeRequestDecisionRequest decision,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        BookingChangeResponse response = walkBookingService.respondToChangeRequest(requestId, decision, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 예약에 대한 변경 요청 목록 조회
     */
    @GetMapping("/{bookingId}/change-requests")
    public ResponseEntity<List<BookingChangeResponse>> getBookingChangeRequests(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        List<BookingChangeResponse> requests = walkBookingService.getBookingChangeRequests(bookingId, userId);
        return ResponseEntity.ok(requests);
    }

    /**
     * 현재 사용자의 대기중인 변경 요청 목록 조회
     * - 내가 보낸 변경 요청 (응답 대기 중)
     * - 나에게 온 변경 요청 (응답해야 할 요청)
     */
    @GetMapping("/pending-change-requests")
    public ResponseEntity<List<BookingChangeResponse>> getPendingChangeRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        List<BookingChangeResponse> requests = walkBookingService.getPendingChangeRequests(userId);
        return ResponseEntity.ok(requests);
    }
}
