package com.petmily.backend.api.walk.controller.booking;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.walk.service.booking.OpenBookingService;
import com.petmily.backend.api.walk.dto.booking.request.WalkApplicationRequest;
import com.petmily.backend.api.walk.dto.booking.request.WalkBookingRequest;
import com.petmily.backend.api.walk.dto.booking.response.WalkApplicationResponse;
import com.petmily.backend.api.walk.dto.booking.response.WalkerBookingResponse;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings/open")
@RequiredArgsConstructor
public class OpenBookingController {

    private final OpenBookingService openBookingService;

    /**
     * 오픈 예약 생성 (사용자가 요청 등록)
     */
    @PostMapping
    public ResponseEntity<WalkerBookingResponse> createOpenBooking(
            @RequestBody WalkBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        WalkerBookingResponse response = openBookingService.createOpenBooking(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 모든 오픈 예약 목록 조회 (워커들이 지원할 수 있는 요청들)
     */
    @GetMapping
    public ResponseEntity<List<WalkerBookingResponse>> getOpenBookings() {
        List<WalkerBookingResponse> openBookings = openBookingService.getOpenBookings();
        return ResponseEntity.ok(openBookings);
    }

    /**
     * 특정 오픈 예약 조회
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<WalkerBookingResponse> getOpenBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        WalkerBookingResponse booking = openBookingService.getOpenBooking(bookingId, userId);
        return ResponseEntity.ok(booking);
    }

    /**
     * 사용자의 오픈 예약 목록 조회
     */
    @GetMapping("/user")
    public ResponseEntity<List<WalkerBookingResponse>> getOpenBookingsByUser(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        List<WalkerBookingResponse> bookings = openBookingService.getOpenBookingsByUser(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * 사용자가 자신의 오픈 예약에 대한 워커 지원자 목록 조회
     */
    @GetMapping("/{openBookingId}/applications")
    public ResponseEntity<List<WalkApplicationResponse>> getApplicationsByUser(
            @PathVariable Long openBookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        List<WalkApplicationResponse> applications = openBookingService.getApplicationsByUser(openBookingId, userId);
        return ResponseEntity.ok(applications);
    }

    /**
     * 워커의 지원 내역 조회
     */
    @GetMapping("/walker")
    public ResponseEntity<List<WalkerBookingResponse>> getApplicationsByWalker(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        List<WalkerBookingResponse> applications = openBookingService.getApplicationsByWalker(userId);
        return ResponseEntity.ok(applications);
    }

    /**
     * 워커가 오픈 예약에 지원
     */
    @PostMapping("/{openBookingId}/apply")
    public ResponseEntity<WalkerBookingResponse> applyToOpenBooking(
            @PathVariable Long openBookingId,
            @RequestBody WalkApplicationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        WalkerBookingResponse response = openBookingService.applyToOpenBooking(openBookingId, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 지원 상태 변경
     * - 워커: CANCELLED (지원 취소)
     * - 사용자: CONFIRMED (수락) / REJECTED (거절)
     */
    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<WalkerBookingResponse> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam WalkBooking.BookingStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        WalkerBookingResponse response = openBookingService.updateApplicationStatus(applicationId, status, userId);
        return ResponseEntity.ok(response);
    }
}
