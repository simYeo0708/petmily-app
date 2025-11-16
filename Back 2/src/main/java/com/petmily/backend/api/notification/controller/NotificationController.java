package com.petmily.backend.api.notification.controller;

import com.petmily.backend.api.common.dto.ApiResponse;
import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.notification.dto.NotificationSettingsRequest;
import com.petmily.backend.api.notification.dto.NotificationSettingsResponse;
import com.petmily.backend.api.notification.dto.PushNotificationRequest;
import com.petmily.backend.api.notification.dto.PushTokenRequest;
import com.petmily.backend.api.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 알림 설정 조회
     */
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<NotificationSettingsResponse>> getNotificationSettings(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        NotificationSettingsResponse settings = notificationService.getNotificationSettings(userId);
        return ResponseEntity.ok(ApiResponse.success(settings, "알림 설정을 조회했습니다."));
    }

    /**
     * 알림 설정 업데이트
     */
    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<NotificationSettingsResponse>> updateNotificationSettings(
            @Valid @RequestBody NotificationSettingsRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        NotificationSettingsResponse settings = notificationService.updateNotificationSettings(userId, request);
        return ResponseEntity.ok(ApiResponse.success(settings, "알림 설정을 업데이트했습니다."));
    }

    /**
     * 푸시 토큰 등록
     */
    @PostMapping("/push-token")
    public ResponseEntity<ApiResponse<Void>> registerPushToken(
            @Valid @RequestBody PushTokenRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        notificationService.registerPushToken(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "푸시 토큰을 등록했습니다."));
    }

    /**
     * 푸시 토큰 해제
     */
    @DeleteMapping("/push-token")
    public ResponseEntity<ApiResponse<Void>> unregisterPushToken(
            @Valid @RequestBody PushTokenRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        notificationService.unregisterPushToken(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "푸시 토큰을 해제했습니다."));
    }

    /**
     * 푸시 알림 전송 (관리자 전용)
     */
    @PostMapping("/push/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> sendPushNotification(
            @Valid @RequestBody PushNotificationRequest request) {
        notificationService.sendPushNotification(request);
        return ResponseEntity.ok(ApiResponse.success(null, "푸시 알림을 전송했습니다."));
    }

    /**
     * 알림 기록 조회
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Object>>> getNotificationHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        // 사용자 ID 조회 로직 필요
        List<Object> history = notificationService.getNotificationHistory(1L); // TODO: 실제 사용자 ID
        return ResponseEntity.ok(ApiResponse.success(history, "알림 기록을 조회했습니다."));
    }

    /**
     * 산책 알림 기록 조회
     */
    @GetMapping("/history/{bookingId}")
    public ResponseEntity<ApiResponse<List<Object>>> getWalkNotificationHistory(
            @PathVariable Long bookingId) {
        List<Object> history = notificationService.getWalkNotificationHistory(bookingId);
        return ResponseEntity.ok(ApiResponse.success(history, "산책 알림 기록을 조회했습니다."));
    }

    /**
     * 전체 사용자 공지사항 전송 (관리자 전용)
     */
    @PostMapping("/announcement/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> sendAnnouncementToAll(
            @RequestParam String title,
            @RequestParam String body) {
        notificationService.sendAnnouncementToAll(title, body);
        return ResponseEntity.ok(ApiResponse.success(null, "전체 사용자에게 공지사항을 전송했습니다."));
    }

    /**
     * 워커 공지사항 전송 (관리자 전용)
     */
    @PostMapping("/announcement/walkers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> sendAnnouncementToWalkers(
            @RequestParam String title,
            @RequestParam String body) {
        notificationService.sendAnnouncementToWalkers(title, body);
        return ResponseEntity.ok(ApiResponse.success(null, "워커들에게 공지사항을 전송했습니다."));
    }

    /**
     * 사용자별 맞춤 알림 전송 (관리자 전용)
     */
    @PostMapping("/custom/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> sendCustomNotification(
            @PathVariable Long userId,
            @RequestParam String title,
            @RequestParam String body,
            @RequestParam(defaultValue = "custom") String type) {
        notificationService.sendCustomNotificationToUser(userId, title, body, type);
        return ResponseEntity.ok(ApiResponse.success(null, "맞춤 알림을 전송했습니다."));
    }

    /**
     * 긴급 알림 전송 (관리자 전용)
     */
    @PostMapping("/emergency/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> sendEmergencyNotification(
            @PathVariable Long userId,
            @RequestParam String title,
            @RequestParam String body) {
        notificationService.sendEmergencyNotification(userId, title, body);
        return ResponseEntity.ok(ApiResponse.success(null, "긴급 알림을 전송했습니다."));
    }

    /**
     * 테스트 알림 전송 (개발용)
     */
    @PostMapping("/test")
    public ResponseEntity<ApiResponse<Void>> sendTestNotification(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        log.info("Test notification requested by: {}", userId);

        // 간단한 테스트 알림
        PushNotificationRequest request = PushNotificationRequest.builder()
                .title("테스트 알림")
                .body("알림 시스템이 정상적으로 작동합니다.")
                .build();

        notificationService.sendPushNotification(request);
        return ResponseEntity.ok(ApiResponse.success(null, "테스트 알림을 전송했습니다."));
    }

    /**
     * 서버 동기화용 더미 엔드포인트
     */
    @GetMapping("/sync")
    public ResponseEntity<ApiResponse<List<Object>>> syncNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        // 실제로는 서버에 저장된 미확인 알림들을 반환해야 함
        // 현재는 빈 리스트 반환
        return ResponseEntity.ok(ApiResponse.success(List.of(), "알림을 동기화했습니다."));
    }
}