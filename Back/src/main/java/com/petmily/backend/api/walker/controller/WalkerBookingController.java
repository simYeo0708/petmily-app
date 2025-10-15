package com.petmily.backend.api.walker.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.walker.dto.walkerBooking.*;
import com.petmily.backend.api.walker.service.WalkerBookingService;
import com.petmily.backend.domain.walker.entity.WalkerBooking;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WalkerBookingController {

    private final WalkerBookingService walkerBookingService;

    /**
     * 산책 예약 생성
     */
    @PostMapping({"/api/walker/bookings", "/api/walker-bookings"})
    public ResponseEntity<WalkerBookingResponse> createBooking(
            @RequestBody WalkerBookingRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerBookingResponse response = walkerBookingService.createBooking(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자의 예약 목록 조회
     */
    @GetMapping({"/api/walker/bookings/user", "/api/walker-bookings/my-bookings"})
    public ResponseEntity<List<WalkerBookingResponse>> getUserBookings(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<WalkerBookingResponse> bookings = walkerBookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * 워커의 예약 목록 조회
     */
    @GetMapping({"/api/walker/bookings/walker", "/api/walker-bookings/walker"})
    public ResponseEntity<List<WalkerBookingResponse>> getWalkerBookings(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<WalkerBookingResponse> bookings = walkerBookingService.getWalkerBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * 특정 예약 조회
     */
    @GetMapping({"/api/walker/bookings/{bookingId}", "/api/walker-bookings/{bookingId}"})
    public ResponseEntity<WalkerBookingResponse> getBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerBookingResponse booking = walkerBookingService.getBooking(bookingId, userId);
        return ResponseEntity.ok(booking);
    }

    /**
     * 예약 상태 변경 (워커가 CONFIRM, IN_PROGRESS, COMPLETED / 사용자가 CANCEL)
     */
    @PutMapping({"/api/walker/bookings/{bookingId}/status", "/api/walker-bookings/{bookingId}/status"})
    public ResponseEntity<WalkerBookingResponse> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam WalkerBooking.BookingStatus status,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerBookingResponse response = walkerBookingService.updateBookingStatus(bookingId, status, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 예약 취소
     */
    @PutMapping({"/api/walker/bookings/{bookingId}/cancel", "/api/walker-bookings/{bookingId}/cancel"})
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        walkerBookingService.cancelBooking(bookingId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 예약 확정 (워커만 가능)
     */
    @PutMapping({"/api/walker/bookings/{bookingId}/confirm", "/api/walker-bookings/{bookingId}/confirm"})
    public ResponseEntity<WalkerBookingResponse> confirmBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerBookingResponse response = walkerBookingService.updateBookingStatus(
            bookingId, WalkerBooking.BookingStatus.CONFIRMED, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 보호자가 등록한 요청 목록 조회 (워커들이 지원할 수 있는 요청들)
     */
    @GetMapping({"/api/walker/bookings/open-requests", "/api/walker-bookings/open-requests"})
    public ResponseEntity<List<WalkerBookingResponse>> getOpenRequests() {
        List<WalkerBookingResponse> openRequests = walkerBookingService.getOpenRequests();
        return ResponseEntity.ok(openRequests);
    }

    /**
     * 워커가 오픈 요청에 지원
     */
    @PostMapping({"/api/walker/bookings/open-requests/{openRequestId}/apply", "/api/walker-bookings/open-requests/{openRequestId}/apply"})
    public ResponseEntity<WalkerBookingResponse> applyToOpenRequest(
            @PathVariable Long openRequestId,
            @RequestBody WalkerApplicationRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerBookingResponse response = walkerBookingService.applyToOpenRequest(openRequestId, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자가 자신의 오픈 요청에 대한 워커 지원자 목록 조회
     */
    @GetMapping({"/api/walker/bookings/{openRequestId}/applications", "/api/walker-bookings/{openRequestId}/applications"})
    public ResponseEntity<List<WalkerApplicationResponse>> getWalkerApplications(
            @PathVariable Long openRequestId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<WalkerApplicationResponse> applications = walkerBookingService.getWalkerApplications(openRequestId, userId);
        return ResponseEntity.ok(applications);
    }

    /**
     * 사용자가 워커 지원을 수락/거절
     */
    @PutMapping({"/api/walker/bookings/applications/{applicationId}/respond", "/api/walker-bookings/applications/{applicationId}/respond"})
    public ResponseEntity<WalkerBookingResponse> respondToWalkerApplication(
            @PathVariable Long applicationId,
            @RequestParam boolean accept,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerBookingResponse response = walkerBookingService.respondToWalkerApplication(applicationId, accept, userId);
        return ResponseEntity.ok(response);
    }
}