package com.petmily.backend.api.cart.controller;

import com.petmily.backend.api.cart.dto.CartAddRequest;
import com.petmily.backend.api.cart.dto.CartResponse;
import com.petmily.backend.api.cart.dto.CartUpdateRequest;
import com.petmily.backend.api.cart.service.CartService;
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
        // TODO: 장바구니 조회 구현
        return ResponseEntity.ok().build();
    }

    @PostMapping("/items")
    public ResponseEntity<Void> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartAddRequest request) {
        // TODO: 장바구니 아이템 추가 구현
        return ResponseEntity.ok().build();
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<Void> updateCartItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartUpdateRequest request) {
        // TODO: 장바구니 아이템 수량 변경 구현
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> removeCartItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: 장바구니 아이템 삭제 구현
        return ResponseEntity.ok().build();
    }

    @PutMapping("/items/{id}/select")
    public ResponseEntity<Void> toggleCartItemSelection(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: 장바구니 아이템 선택/해제 구현
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        // TODO: 장바구니 비우기 구현
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items")
    public ResponseEntity<Void> removeSelectedItems(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam List<Long> itemIds) {
        // TODO: 선택된 장바구니 아이템들 삭제 구현
        return ResponseEntity.ok().build();
    }
}