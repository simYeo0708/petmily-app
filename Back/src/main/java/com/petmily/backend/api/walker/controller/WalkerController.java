package com.petmily.backend.api.walker.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.walker.dto.walker.WalkerCreateRequest;
import com.petmily.backend.api.walker.dto.walker.WalkerResponse;
import com.petmily.backend.api.walker.dto.walker.WalkerUpdateRequest;
import com.petmily.backend.api.walker.dto.walker.WalkerSearchRequest;
import com.petmily.backend.api.walker.service.WalkerService;
import com.petmily.backend.api.walker.service.WalkerSearchService;
import com.petmily.backend.domain.user.entity.User;
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
    public ResponseEntity<WalkerResponse> registerWalker(
            @RequestBody WalkerCreateRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerResponse response = walkerService.registerWalker(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WalkerResponse> getWalkerProfile(@PathVariable long id) {
        WalkerResponse response = walkerService.getWalkerProfile(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<WalkerResponse>> getAllWalkers(
            @ModelAttribute WalkerSearchRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<WalkerResponse> response = walkerService.getAllWalkers(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<WalkerResponse> getCurrentWalkerProfile(Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerResponse response = walkerService.getWalkerByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<WalkerResponse> updateCurrentWalkerProfile(
            @RequestBody WalkerUpdateRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        WalkerResponse response = walkerService.updateCurrentWalkerProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 즐겨찾기 워커 추가
     */
    @PostMapping("/{walkerId}/favorite")
    public ResponseEntity<Void> addFavoriteWalker(
            @PathVariable Long walkerId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        walkerService.addFavoriteWalker(walkerId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 즐겨찾기 워커 제거
     */
    @DeleteMapping("/{walkerId}/favorite")
    public ResponseEntity<Void> removeFavoriteWalker(
            @PathVariable Long walkerId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        walkerService.removeFavoriteWalker(walkerId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 즐겨찾기 워커 목록 조회
     */
    @GetMapping("/favorites")
    public ResponseEntity<List<WalkerResponse>> getFavoriteWalkers(
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        List<WalkerResponse> favorites = walkerService.getFavoriteWalkers(userId);
        return ResponseEntity.ok(favorites);
    }

    /**
     * 워커가 즐겨찾기에 있는지 확인
     */
    @GetMapping("/{walkerId}/favorite/check")
    public ResponseEntity<Boolean> isFavoriteWalker(
            @PathVariable Long walkerId,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        boolean isFavorite = walkerService.isFavoriteWalker(walkerId, userId);
        return ResponseEntity.ok(isFavorite);
    }

    /**
     * 고급 워커 검색 (페이징 지원)
     */
    @GetMapping("/search")
    public ResponseEntity<Page<WalkerResponse>> searchWalkers(
            @ModelAttribute WalkerSearchRequest request,
            Authentication authentication) {
        Long userId = SecurityUtils.getUserId(authentication);
        Page<WalkerResponse> response = walkerSearchService.searchWalkers(request, userId);
        return ResponseEntity.ok(response);
    }

}