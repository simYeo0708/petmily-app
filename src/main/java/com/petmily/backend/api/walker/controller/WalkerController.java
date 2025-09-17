package com.petmily.backend.api.walker.controller;

import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileCreateRequest;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileResponse;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileUpdateRequest;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerSearchRequest;
import com.petmily.backend.api.walker.dto.WalkerStatus;
import com.petmily.backend.api.walker.service.WalkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/walker")
public class WalkerController {

    private final WalkerService walkerService;

    @PostMapping
    public ResponseEntity<WalkerProfileResponse> registerWalker(@RequestBody WalkerProfileCreateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        WalkerProfileResponse response = walkerService.registerWalker(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WalkerProfileResponse> getWalkerProfile(@PathVariable long id) {
        WalkerProfileResponse response = walkerService.getWalkerProfile(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<WalkerProfileResponse>> getAllWalkers(@ModelAttribute WalkerSearchRequest searchRequest) {
        List<WalkerProfileResponse> response = walkerService.getAllWalkers(searchRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<WalkerProfileResponse> getCurrentWalkerProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        WalkerProfileResponse response = walkerService.getWalkerProfileByUsername(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<WalkerProfileResponse> updateCurrentWalkerProfile(@RequestBody WalkerProfileUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        WalkerProfileResponse response = walkerService.updateWalkerProfile(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }

    // Admin endpoint
    @PutMapping("/admin/{id}/status")
    public ResponseEntity<WalkerProfileResponse> updateWalkerStatus(@PathVariable long id, @RequestParam WalkerStatus status) {
        // Security for admin access should be handled by Spring Security configuration
        WalkerProfileResponse response = walkerService.updateWalkerStatus(id, status);
        return ResponseEntity.ok(response);
    }
}