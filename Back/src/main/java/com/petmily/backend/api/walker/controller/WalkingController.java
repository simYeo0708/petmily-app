package com.petmily.backend.api.walker.controller;

import com.petmily.backend.api.walker.dto.walkerBooking.*;
import com.petmily.backend.api.walker.dto.walking.*;
import com.petmily.backend.api.walker.service.WalkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/walking")
@RequiredArgsConstructor
public class WalkingController {

    private final WalkingService walkingService;

    @PostMapping("/{bookingId}/start")
    public ResponseEntity<WalkerBookingResponse> startWalk(
            @PathVariable Long bookingId,
            Authentication authentication) {
        String username = authentication.getName();
        WalkerBookingResponse response = walkingService.startWalk(bookingId, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/complete")
    public ResponseEntity<WalkerBookingResponse> completeWalk(
            @PathVariable Long bookingId,
            Authentication authentication) {
        String username = authentication.getName();
        WalkerBookingResponse response = walkingService.completeWalk(bookingId, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/track")
    public ResponseEntity<WalkingTrackResponse> saveWalkingTrack(
            @PathVariable Long bookingId,
            @RequestBody LocationTrackRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WalkingTrackResponse response = walkingService.saveWalkingTrack(bookingId, request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/path")
    public ResponseEntity<WalkingPathResponse> getWalkingPath(
            @PathVariable Long bookingId,
            Authentication authentication) {
        String username = authentication.getName();
        WalkingPathResponse response = walkingService.getWalkingPath(bookingId, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/realtime")
    public ResponseEntity<List<WalkingTrackResponse>> getRealtimeLocation(
            @PathVariable Long bookingId,
            @RequestParam(required = false) LocalDateTime afterTime,
            Authentication authentication) {
        String username = authentication.getName();
        LocalDateTime queryTime = afterTime != null ? afterTime : LocalDateTime.now().minusMinutes(1);
        List<WalkingTrackResponse> response = walkingService.getRealtimeLocation(bookingId, queryTime, username);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{bookingId}/location")
    public ResponseEntity<WalkerBookingResponse> updateLocation(
            @PathVariable Long bookingId,
            @RequestBody LocationUpdateRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WalkerBookingResponse response = walkingService.updateLocation(bookingId, request, username);
        return ResponseEntity.ok(response);
    }

    // photoType: START, MIDDLE, END
    @PutMapping("/{bookingId}/photos")
    public ResponseEntity<WalkerBookingResponse> uploadPhoto(
            @PathVariable Long bookingId,
            @RequestBody PhotoUploadRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WalkerBookingResponse response = walkingService.uploadPhoto(bookingId, request, username);
        return ResponseEntity.ok(response);
    }
}