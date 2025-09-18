package com.petmily.backend.api.cart.controller;

import com.petmily.backend.api.cart.dto.CartAddRequest;
import com.petmily.backend.api.cart.dto.CartResponse;
import com.petmily.backend.api.cart.dto.CartUpdateRequest;
import com.petmily.backend.api.cart.service.CartService;
import com.petmily.backend.api.common.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        CartResponse cart = cartService.getCart(userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<Void> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartAddRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        cartService.addToCart(userId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<Void> updateCartItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartUpdateRequest request) {
        Long userId = SecurityUtils.getUserId(userDetails);
        cartService.updateCartItem(id, userId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> removeCartItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        cartService.removeCartItem(id, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/items/{id}/select")
    public ResponseEntity<Void> toggleCartItemSelection(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        cartService.toggleCartItemSelection(id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = SecurityUtils.getUserId(userDetails);
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items")
    public ResponseEntity<Void> removeSelectedItems(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam List<Long> itemIds) {
        Long userId = SecurityUtils.getUserId(userDetails);
        cartService.removeSelectedItems(userId, itemIds);
        return ResponseEntity.ok().build();
    }
}