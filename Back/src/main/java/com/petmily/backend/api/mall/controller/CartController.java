package com.petmily.backend.api.mall.controller;

import com.petmily.backend.api.common.util.SecurityUtils;
import com.petmily.backend.api.mall.dto.cart.request.CartAddRequest;
import com.petmily.backend.api.mall.dto.cart.response.CartResponse;
import com.petmily.backend.api.mall.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CartController {

    private final CartService cartService;

    // 장바구니에 상품 추가
    @PostMapping
    public ResponseEntity<CartResponse> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartAddRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }

    // 장바구니 목록 조회
    @GetMapping
    public ResponseEntity<List<CartResponse>> getCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    // 장바구니 수량 변경
    @PutMapping("/{cartId}")
    public ResponseEntity<CartResponse> updateCartQuantity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartId,
            @RequestParam Integer quantity) {
        Long userId = SecurityUtils.getUserId(userDetails);
        return ResponseEntity.ok(cartService.updateQuantity(userId, cartId, quantity));
    }

    // 장바구니 항목 삭제
    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> removeCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartId) {
        Long userId = SecurityUtils.getUserId(userDetails);
        cartService.removeFromCart(userId, cartId);
        return ResponseEntity.noContent().build();
    }

    // 장바구니 전체 삭제
    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
