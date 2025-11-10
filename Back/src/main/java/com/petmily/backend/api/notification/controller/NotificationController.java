package com.petmily.backend.api.notification.controller;

import com.petmily.backend.api.notification.dto.DismissNotificationRequest;
import com.petmily.backend.api.notification.dto.NotificationResponse;
import com.petmily.backend.api.notification.service.NotificationService;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    
    // SecurityContext에서 현재 사용자 ID 가져오기
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            try {
                // 먼저 숫자로 파싱 시도 (userId인 경우)
                return Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                // 파싱 실패 시 username이므로 데이터베이스에서 조회
                String username = authentication.getName();
                log.debug("Getting userId for username: {}", username);
                return userRepository.findByUsername(username)
                    .map(user -> user.getId())
                    .orElse(null);
            }
        }
        return null;
    }
    
    /**
     * 사용자에게 표시할 알림 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getActiveNotifications() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                // 인증되지 않은 사용자도 공개 알림은 볼 수 있도록 기본 userId 사용
                userId = 0L;
            }
            List<NotificationResponse> notifications = notificationService.getActiveNotificationsForUser(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("알림 목록 조회 중 오류 발생", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 알림 숨기기 처리
     */
    @PostMapping("/dismiss")
    public ResponseEntity<Void> dismissNotification(@RequestBody DismissNotificationRequest request) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            notificationService.dismissNotification(userId, request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("알림 숨기기 처리 중 오류 발생", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 알림 숨기기 취소
     */
    @DeleteMapping("/dismiss/{notificationId}")
    public ResponseEntity<Void> cancelDismissNotification(@PathVariable Long notificationId) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            notificationService.cancelDismissNotification(userId, notificationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("알림 숨기기 취소 중 오류 발생", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 만료된 숨기기 설정 정리 (관리자용)
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Void> cleanupExpiredDismissals() {
        try {
            notificationService.cleanupExpiredDismissals();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("만료된 숨기기 설정 정리 중 오류 발생", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
