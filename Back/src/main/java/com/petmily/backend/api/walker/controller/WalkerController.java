package com.petmily.backend.api.walker.controller;

import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileCreateRequest;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileResponse;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerProfileUpdateRequest;
import com.petmily.backend.api.walker.dto.walkerProfile.WalkerSearchRequest;
import com.petmily.backend.api.walker.service.WalkerService;
import com.petmily.backend.api.walker.service.WalkerSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/walkers")
public class WalkerController {

    private final WalkerService walkerService;
    private final WalkerSearchService walkerSearchService;

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

    /**
     * 즐겨찾기 워커 추가
     */
    @PostMapping("/{walkerId}/favorite")
    public ResponseEntity<WalkerProfileResponse> addFavoriteWalker(
            @PathVariable Long walkerId,
            Authentication authentication) {
        String username = authentication.getName();
        WalkerProfileResponse response = walkerService.addFavoriteWalker(walkerId, username);
        return ResponseEntity.ok(response);
    }

    /**
     * 즐겨찾기 워커 제거
     */
    @DeleteMapping("/{walkerId}/favorite")
    public ResponseEntity<Void> removeFavoriteWalker(
            @PathVariable Long walkerId,
            Authentication authentication) {
        String username = authentication.getName();
        walkerService.removeFavoriteWalker(walkerId, username);
        return ResponseEntity.ok().build();
    }

    /**
     * 즐겨찾기 워커 목록 조회
     */
    @GetMapping("/favorites")
    public ResponseEntity<List<WalkerProfileResponse>> getFavoriteWalkers(
            Authentication authentication) {
        String username = authentication.getName();
        List<WalkerProfileResponse> favorites = walkerService.getFavoriteWalkers(username);
        return ResponseEntity.ok(favorites);
    }

    /**
     * 워커가 즐겨찾기에 있는지 확인
     */
    @GetMapping("/{walkerId}/favorite/check")
    public ResponseEntity<Boolean> isFavoriteWalker(
            @PathVariable Long walkerId,
            Authentication authentication) {
        String username = authentication.getName();
        boolean isFavorite = walkerService.isFavoriteWalker(walkerId, username);
        return ResponseEntity.ok(isFavorite);
    }

    /**
     * 고급 워커 검색 (페이징 지원)
     */
    @GetMapping("/search")
    public ResponseEntity<Page<WalkerProfileResponse>> searchWalkers(
            @ModelAttribute WalkerSearchRequest searchRequest,
            Authentication authentication) {
        String username = authentication.getName();
        Page<WalkerProfileResponse> response = walkerSearchService.searchWalkers(searchRequest, username);
        return ResponseEntity.ok(response);
    }

}