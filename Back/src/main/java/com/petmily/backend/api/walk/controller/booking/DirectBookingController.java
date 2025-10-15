package com.petmily.backend.api.walk.controller.booking;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.walk.dto.booking.request.WalkBookingRequest;
import com.petmily.backend.api.walk.dto.booking.response.WalkBookingResponse;
import com.petmily.backend.api.walk.service.booking.DirectBookingService;
import com.petmily.backend.domain.walk.entity.WalkBooking;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings/direct")
@RequiredArgsConstructor
public class DirectBookingController {

    private final DirectBookingService directBookingService;

    /**
     * 직접 예약 생성 (사용자가 워커 선택)
     */
    @PostMapping
    public ResponseEntity<WalkBookingResponse> createDirectBooking(
            @RequestBody WalkBookingRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkBookingResponse response = directBookingService.createWalkerSelectionBooking(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자의 직접 예약 목록 조회
     */
    @GetMapping("/user")
    public ResponseEntity<List<WalkBookingResponse>> getUserDirectBookings(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<WalkBookingResponse> bookings = directBookingService.getDirectBookingsByUser(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * 워커의 직접 예약 목록 조회
     */
    @GetMapping("/walker")
    public ResponseEntity<List<WalkBookingResponse>> getWalkerDirectBookings(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<WalkBookingResponse> bookings = directBookingService.getDirectBookingsByWalker(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * 특정 직접 예약 조회
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<WalkBookingResponse> getDirectBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkBookingResponse booking = directBookingService.getDirectBooking(bookingId, userId);
        return ResponseEntity.ok(booking);
    }

    /**
     * 예약 상태 변경 (워커가 CONFIRM / 사용자가 CANCEL)
     */
    @PutMapping("/{bookingId}/status")
    public ResponseEntity<WalkBookingResponse> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam WalkBooking.BookingStatus status,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkBookingResponse response = directBookingService.updateBookingStatus(bookingId, status, userId);
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
        directBookingService.cancelBooking(bookingId, userId);
        return ResponseEntity.ok().build();
    }
}
