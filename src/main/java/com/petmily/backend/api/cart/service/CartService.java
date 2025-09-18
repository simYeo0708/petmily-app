package com.petmily.backend.api.cart.service;

import com.petmily.backend.api.cart.dto.CartAddRequest;
import com.petmily.backend.api.cart.dto.CartResponse;
import com.petmily.backend.api.cart.dto.CartUpdateRequest;
import com.petmily.backend.domain.cart.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartItemRepository cartItemRepository;

    public CartResponse getCart(Long userId) {
        // TODO: 장바구니 조회 로직 구현
        return null;
    }

    @Transactional
    public void addToCart(Long userId, CartAddRequest request) {
        // TODO: 장바구니 아이템 추가 로직 구현
    }

    @Transactional
    public void updateCartItem(Long itemId, Long userId, CartUpdateRequest request) {
        // TODO: 장바구니 아이템 수량 변경 로직 구현
    }

    @Transactional
    public void removeCartItem(Long itemId, Long userId) {
        // TODO: 장바구니 아이템 삭제 로직 구현
    }

    @Transactional
    public void toggleCartItemSelection(Long itemId, Long userId) {
        // TODO: 장바구니 아이템 선택/해제 로직 구현
    }

    @Transactional
    public void clearCart(Long userId) {
        // TODO: 장바구니 비우기 로직 구현
    }

    @Transactional
    public void removeSelectedItems(Long userId, List<Long> itemIds) {
        // TODO: 선택된 장바구니 아이템들 삭제 로직 구현
    }

    public int getCartItemCount(Long userId) {
        // TODO: 장바구니 아이템 개수 조회 로직 구현
        return 0;
    }
}