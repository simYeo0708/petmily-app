package com.petmily.backend.api.walk.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.walk.dto.booking.*;
import com.petmily.backend.api.walk.service.WalkBookingService;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/walk/bookings")
@RequiredArgsConstructor
public class WalkBookingController {

    private final WalkBookingService walkBookingService;

    /**
     * 산책 예약 생성
     */
    @PostMapping
    public ResponseEntity<WalkBookingResponse> createBooking(
            @RequestBody WalkBookingRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkBookingResponse response = walkBookingService.createBooking(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자의 예약 목록 조회
     */
    @GetMapping("/user")
    public ResponseEntity<List<WalkBookingResponse>> getUserBookings(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<WalkBookingResponse> bookings = walkBookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * 워커의 예약 목록 조회
     */
    @GetMapping("/walker")
    public ResponseEntity<List<WalkBookingResponse>> getWalkerBookings(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<WalkBookingResponse> bookings = walkBookingService.getWalkerBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * 특정 예약 조회
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<WalkBookingResponse> getBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkBookingResponse booking = walkBookingService.getBooking(bookingId, userId);
        return ResponseEntity.ok(booking);
    }

    /**
     * 예약 상태 변경 (워커가 CONFIRM, IN_PROGRESS, COMPLETED / 사용자가 CANCEL)
     */
    @PutMapping("/{bookingId}/status")
    public ResponseEntity<WalkBookingResponse> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam WalkBooking.BookingStatus status,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkBookingResponse response = walkBookingService.updateBookingStatus(bookingId, status, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 예약 취소
     */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        walkBookingService.cancelBooking(bookingId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 보호자가 등록한 요청 목록 조회 (워커들이 지원할 수 있는 요청들)
     */
    @GetMapping("/open-requests")
    public ResponseEntity<List<WalkBookingResponse>> getOpenRequests() {
        List<WalkBookingResponse> openRequests = walkBookingService.getOpenRequests();
        return ResponseEntity.ok(openRequests);
    }

    /**
     * 워커가 오픈 요청에 지원
     */
    @PostMapping("/open-requests/{openRequestId}/apply")
    public ResponseEntity<WalkBookingResponse> applyToOpenRequest(
            @PathVariable Long openRequestId,
            @RequestBody WalkApplicationRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkBookingResponse response = walkBookingService.applyToOpenRequest(openRequestId, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자가 자신의 오픈 요청에 대한 워커 지원자 목록 조회
     */
    @GetMapping("/{openRequestId}/applications")
    public ResponseEntity<List<WalkApplicationResponse>> getWalkerApplications(
            @PathVariable Long openRequestId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<WalkApplicationResponse> applications = walkBookingService.getWalkerApplications(openRequestId, userId);
        return ResponseEntity.ok(applications);
    }

    /**
     * 사용자가 워커 지원을 수락/거절
     */
    @PutMapping("/applications/{applicationId}/respond")
    public ResponseEntity<WalkBookingResponse> respondToWalkerApplication(
            @PathVariable Long applicationId,
            @RequestParam boolean accept,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkBookingResponse response = walkBookingService.respondToWalkerApplication(applicationId, accept, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 예약 변경 요청 (사용자가 요청)
     */
    @PostMapping("/{bookingId}/change-requests")
    public ResponseEntity<BookingChangeResponse> requestBookingChange(
            @PathVariable Long bookingId,
            @RequestBody BookingChangeRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        BookingChangeResponse response = walkBookingService.requestBookingChange(bookingId, request, username);
        return ResponseEntity.ok(response);
    }

    /**
     * 예약 변경 요청에 대한 워커의 응답
     */
    @PutMapping("/change-requests/{requestId}/respond")
    public ResponseEntity<BookingChangeResponse> respondToChangeRequest(
            @PathVariable Long requestId,
            @RequestBody ChangeRequestDecisionRequest decision,
            Authentication authentication) {
        String username = authentication.getName();
        BookingChangeResponse response = walkBookingService.respondToChangeRequest(requestId, decision, username);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 예약에 대한 변경 요청 목록 조회
     */
    @GetMapping("/{bookingId}/change-requests")
    public ResponseEntity<List<BookingChangeResponse>> getBookingChangeRequests(
            @PathVariable Long bookingId,
            Authentication authentication) {
        String username = authentication.getName();
        List<BookingChangeResponse> requests = walkBookingService.getBookingChangeRequests(bookingId, username);
        return ResponseEntity.ok(requests);
    }

    /**
     * 워커의 대기중인 변경 요청 목록 조회
     */
    @GetMapping("/walker/pending-change-requests")
    public ResponseEntity<List<BookingChangeResponse>> getPendingChangeRequestsForWalker(
            Authentication authentication) {
        String username = authentication.getName();
        List<BookingChangeResponse> requests = walkBookingService.getPendingChangeRequestsForWalker(username);
        return ResponseEntity.ok(requests);
    }
}
