package com.petmily.backend.api.walker.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.walk.dto.booking.request.*;
import com.petmily.backend.api.walk.dto.booking.response.*;
import com.petmily.backend.api.walk.service.booking.DirectBookingService;
import com.petmily.backend.api.walk.service.booking.OpenBookingService;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WalkBookingController {

    private final DirectBookingService directBookingService;
    private final OpenBookingService openBookingService;

    /**
     * 산책 예약 생성
     */
    @PostMapping({"/walker/bookings", "/walker-bookings"})
    public ResponseEntity<WalkerBookingResponse> createBooking(
            @RequestBody WalkBookingRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        // walkerId가 있으면 직접 예약, 없으면 오픈 요청
        WalkerBookingResponse response;
        if (request.getWalkerId() != null) {
            response = directBookingService.createWalkerSelectionBooking(userId, request);
        } else {
            response = openBookingService.createOpenBooking(userId, request);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자의 예약 목록 조회
     */
    @GetMapping({"/walker/bookings/user", "/walker-bookings/my-bookings"})
    public ResponseEntity<List<WalkerBookingResponse>> getUserBookings(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        // 직접 예약과 오픈 요청 모두 조회
        List<WalkerBookingResponse> directBookings = directBookingService.getDirectBookingsByUser(userId);
        List<WalkerBookingResponse> openBookings = openBookingService.getOpenBookingsByUser(userId);
        // 합치기
        List<WalkerBookingResponse> allBookings = new java.util.ArrayList<>();
        allBookings.addAll(directBookings);
        allBookings.addAll(openBookings);
        return ResponseEntity.ok(allBookings);
    }

    /**
     * 사용자의 현재 진행 중인 산책 조회
     */
    @GetMapping({"/walker/bookings/current", "/walker-bookings/current"})
    public ResponseEntity<WalkerBookingResponse> getCurrentWalking(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerBookingResponse currentBooking = directBookingService.getCurrentWalkingByUser(userId);
        if (currentBooking == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(currentBooking);
    }

    /**
     * 워커의 예약 목록 조회
     */
    @GetMapping({"/walker/bookings/walker", "/walker-bookings/walker"})
    public ResponseEntity<List<WalkerBookingResponse>> getWalkBookings(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        // 직접 예약만 조회 (워커의 예약)
        List<WalkerBookingResponse> bookings = directBookingService.getDirectBookingsByWalker(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * 특정 예약 조회
     */
    @GetMapping({"/walker/bookings/{bookingId}", "/walker-bookings/{bookingId}"})
    public ResponseEntity<WalkerBookingResponse> getBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        // 먼저 직접 예약으로 시도
        try {
            WalkerBookingResponse booking = directBookingService.getDirectBooking(bookingId, userId);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            // 직접 예약이 아니면 오픈 요청으로 시도
            WalkerBookingResponse booking = openBookingService.getOpenBooking(bookingId, userId);
            return ResponseEntity.ok(booking);
        }
    }

    /**
     * 예약 상태 변경 (워커가 CONFIRM, IN_PROGRESS, COMPLETED / 사용자가 CANCEL)
     */
    @PutMapping({"/walker/bookings/{bookingId}/status", "/walker-bookings/{bookingId}/status"})
    public ResponseEntity<WalkerBookingResponse> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam WalkBooking.BookingStatus status,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        // 직접 예약 상태 업데이트
        WalkerBookingResponse response = directBookingService.updateBookingStatus(bookingId, status, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 예약 취소
     */
    @PutMapping({"/walker/bookings/{bookingId}/cancel", "/walker-bookings/{bookingId}/cancel"})
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        directBookingService.cancelBooking(bookingId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 예약 확정 (워커만 가능)
     */
    @PutMapping({"/walker/bookings/{bookingId}/confirm", "/walker-bookings/{bookingId}/confirm"})
    public ResponseEntity<WalkerBookingResponse> confirmBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerBookingResponse response = directBookingService.updateBookingStatus(
            bookingId, WalkBooking.BookingStatus.CONFIRMED, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 보호자가 등록한 요청 목록 조회 (워커들이 지원할 수 있는 요청들)
     */
    @GetMapping({"/walker/bookings/open-requests", "/walker-bookings/open-requests"})
    public ResponseEntity<List<WalkerBookingResponse>> getOpenRequests() {
        List<WalkerBookingResponse> openRequests = openBookingService.getOpenBookings();
        return ResponseEntity.ok(openRequests);
    }

    /**
     * 워커가 오픈 요청에 지원
     */
    @PostMapping({"/walker/bookings/open-requests/{openRequestId}/apply", "/walker-bookings/open-requests/{openRequestId}/apply"})
    public ResponseEntity<WalkerBookingResponse> applyToOpenRequest(
            @PathVariable Long openRequestId,
            @RequestBody WalkApplicationRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerBookingResponse response = openBookingService.applyToOpenBooking(openRequestId, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자가 자신의 오픈 요청에 대한 워커 지원자 목록 조회
     */
    @GetMapping({"/walker/bookings/{openRequestId}/applications", "/walker-bookings/{openRequestId}/applications"})
    public ResponseEntity<List<WalkApplicationResponse>> getWalkerApplications(
            @PathVariable Long openRequestId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<WalkApplicationResponse> applications = openBookingService.getApplicationsByUser(openRequestId, userId);
        return ResponseEntity.ok(applications);
    }

    /**
     * 사용자가 워커 지원을 수락/거절
     */
    @PutMapping({"/walker/bookings/applications/{applicationId}/respond", "/walker-bookings/applications/{applicationId}/respond"})
    public ResponseEntity<WalkerBookingResponse> respondToWalkerApplication(
            @PathVariable Long applicationId,
            @RequestParam boolean accept,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkBooking.BookingStatus status = accept ? WalkBooking.BookingStatus.CONFIRMED : WalkBooking.BookingStatus.REJECTED;
        WalkerBookingResponse response = openBookingService.updateApplicationStatus(applicationId, status, userId);
        return ResponseEntity.ok(response);
    }
}