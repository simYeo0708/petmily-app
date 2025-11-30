package com.petmily.backend.api.admin;

import com.petmily.backend.api.walker.dto.walker.WalkerResponse;
import com.petmily.backend.domain.walker.entity.WalkerStatus;
import com.petmily.backend.api.walker.service.WalkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/walkers")
@PreAuthorize("hasRole('ADMIN')")
public class WalkerAdminController {

    private final WalkerService walkerService;

    /**
     * PENDING 상태의 워커 목록 조회 (관리자 전용)
     */
    @GetMapping("/pending")
    public ResponseEntity<List<WalkerResponse>> getPendingWalkers() {
        List<WalkerResponse> response = walkerService.getPendingWalkers();
        return ResponseEntity.ok(response);
    }

    /**
     * 워커 상태 변경 (관리자 전용)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<WalkerResponse> updateWalkerStatus(
            @PathVariable long id,
            @RequestParam WalkerStatus status) {
        WalkerResponse response = walkerService.updateWalkerStatus(id, status);
        return ResponseEntity.ok(response);
    }
}