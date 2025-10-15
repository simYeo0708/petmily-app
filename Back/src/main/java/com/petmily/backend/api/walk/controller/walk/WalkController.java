package com.petmily.backend.api.walk.controller.walk;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.walk.dto.booking.response.WalkBookingResponse;
import com.petmily.backend.api.walk.dto.tracking.request.*;
import com.petmily.backend.api.walk.dto.tracking.response.*;
import com.petmily.backend.api.walk.service.walk.WalkService;
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
    public ResponseEntity<WalkSessionResponse> startWalk(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkSessionResponse response = walkService.startWalk(bookingId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 산책 완료 (특이사항 포함)
     */
    @PostMapping("/{bookingId}/complete")
    public ResponseEntity<WalkCompletionResponse> completeWalk(
            @PathVariable Long bookingId,
            @RequestBody WalkEndRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkCompletionResponse response = walkService.completeWalk(bookingId, request, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/track")
    public ResponseEntity<WalkTrackResponse> saveWalkTrack(
            @PathVariable Long bookingId,
            @RequestBody LocationTrackRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkTrackResponse response = walkService.saveWalkTrack(bookingId, request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/path")
    public ResponseEntity<WalkPathResponse> getWalkPath(
            @PathVariable Long bookingId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkPathResponse response = walkService.getWalkPath(bookingId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/realtime")
    public ResponseEntity<List<WalkTrackResponse>> getRealtimeLocation(
            @PathVariable Long bookingId,
            @RequestParam(required = false) LocalDateTime afterTime,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        LocalDateTime queryTime = afterTime != null ? afterTime : LocalDateTime.now().minusMinutes(1);
        List<WalkTrackResponse> response = walkService.getRealtimeLocation(bookingId, queryTime, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{bookingId}/photos")
    public ResponseEntity<WalkDetailResponse> uploadPhoto(
            @PathVariable Long bookingId,
            @RequestBody PhotoUploadRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkDetailResponse response = walkService.uploadPhoto(bookingId, request, userId);
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
        Long userId = SecurityUtils.getUserId(authentication);
        String contactNumber = walkService.initiateEmergencyCall(bookingId, request, userId);
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
        Long userId = SecurityUtils.getUserId(authentication);
        WalkBookingResponse response = walkService.requestWalkTermination(bookingId, request, userId);
        return ResponseEntity.ok(response);
    }
}
