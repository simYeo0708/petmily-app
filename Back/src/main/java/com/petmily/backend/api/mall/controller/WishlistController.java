package com.petmily.backend.api.mall.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.mall.dto.wishlist.WishlistAddRequest;
import com.petmily.backend.api.mall.dto.wishlist.WishlistResponse;
import com.petmily.backend.api.mall.enums.ShoppingMall;
import com.petmily.backend.api.mall.service.wishlist.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mall/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    /**
     * 찜하기 추가
     */
    @PostMapping
    public ResponseEntity<WishlistResponse> addWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WishlistAddRequest request) {

        Long userId = SecurityUtils.getUserId(userDetails);
        WishlistResponse response = wishlistService.addWishlist(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 찜하기 삭제
     */
    @DeleteMapping("/{wishlistId}")
    public ResponseEntity<Void> deleteWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long wishlistId) {
        Long userId = SecurityUtils.getUserId(userDetails);
        wishlistService.deleteWishlist(userId, wishlistId);
        return ResponseEntity.ok().build();
    }

    /**
     * 내 찜 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<WishlistResponse>> getMyWishlist(@AuthenticationPrincipal UserDetails userDetails){
        Long userId = SecurityUtils.getUserId(userDetails);
        List<WishlistResponse> wishlists = wishlistService.getMyWishlist(userId);
        return ResponseEntity.ok(wishlists);
    }

    /**
     * 찜 여부 확인
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String externalProductId,
            @RequestParam ShoppingMall source) {
        Long userId = SecurityUtils.getUserId(userDetails);
        boolean isWishlisted = wishlistService.isWishlisted(userId, externalProductId, source);
        return ResponseEntity.ok(isWishlisted);
    }

    /**
     * 가격 변동 수동 체크
     */
    @PostMapping("/check-prices")
    public ResponseEntity<Void> checkPrices(@AuthenticationPrincipal UserDetails userDetails){
        Long userId = SecurityUtils.getUserId(userDetails);
        wishlistService.checkUserWishlistPrices(userId);
        return ResponseEntity.ok().build();
    }

}
