package com.petmily.backend.api.walk.controller;

import com.petmily.backend.api.walk.dto.booking.*;
import com.petmily.backend.api.walk.dto.tracking.*;
import com.petmily.backend.api.walk.service.WalkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/walk")
@RequiredArgsConstructor
public class WalkController {

    private final WalkService walkService;

    @PostMapping("/{bookingId}/start")
    public ResponseEntity<WalkBookingResponse> startWalk(
            @PathVariable Long bookingId,
            Authentication authentication) {
        String username = authentication.getName();
        WalkBookingResponse response = walkService.startWalk(bookingId, username);
        return ResponseEntity.ok(response);
    }

    /**
     * 산책 완료 (특이사항 포함)
     */
    @PostMapping("/{bookingId}/complete")
    public ResponseEntity<WalkBookingResponse> completeWalk(
            @PathVariable Long bookingId,
            @RequestBody WalkEndRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WalkBookingResponse response = walkService.completeWalk(bookingId, request, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/track")
    public ResponseEntity<WalkTrackResponse> saveWalkingTrack(
            @PathVariable Long bookingId,
            @RequestBody LocationTrackRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WalkTrackResponse response = walkService.saveWalkTrack(bookingId, request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/path")
    public ResponseEntity<WalkPathResponse> getWalkingPath(
            @PathVariable Long bookingId,
            Authentication authentication) {
        String username = authentication.getName();
        WalkPathResponse response = walkService.getWalkingPath(bookingId, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/realtime")
    public ResponseEntity<List<WalkTrackResponse>> getRealtimeLocation(
            @PathVariable Long bookingId,
            @RequestParam(required = false) LocalDateTime afterTime,
            Authentication authentication) {
        String username = authentication.getName();
        LocalDateTime queryTime = afterTime != null ? afterTime : LocalDateTime.now().minusMinutes(1);
        List<WalkTrackResponse> response = walkService.getRealtimeLocation(bookingId, queryTime, username);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{bookingId}/location")
    public ResponseEntity<WalkBookingResponse> updateLocation(
            @PathVariable Long bookingId,
            @RequestBody LocationUpdateRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WalkBookingResponse response = walkService.updateLocation(bookingId, request, username);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{bookingId}/photos")
    public ResponseEntity<WalkBookingResponse> uploadPhoto(
            @PathVariable Long bookingId,
            @RequestBody PhotoUploadRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WalkBookingResponse response = walkService.uploadPhoto(bookingId, request, username);
        return ResponseEntity.ok(response);
    }

    /**
     * 긴급호출 (112/119/비상연락망)
     */
    @PostMapping("/{bookingId}/emergency-call")
    public ResponseEntity<String> initiateEmergencyCall(
            @PathVariable Long bookingId,
            @RequestBody EmergencyCallRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        String contactNumber = walkService.initiateEmergencyCall(bookingId, request, username);
        return ResponseEntity.ok(contactNumber);
    }

    /**
     * 산책 종료 요청 (양방향 동의 필요)
     */
    @PostMapping("/{bookingId}/request-termination")
    public ResponseEntity<WalkBookingResponse> requestWalkTermination(
            @PathVariable Long bookingId,
            @RequestBody WalkTerminationRequest request,
            Authentication authentication) {
        String username = authentication.getName();
        WalkBookingResponse response = walkService.requestWalkTermination(bookingId, request, username);
        return ResponseEntity.ok(response);
    }
}
