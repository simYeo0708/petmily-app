package com.petmily.backend.api.cart.service;

import com.petmily.backend.api.cart.dto.CartAddRequest;
import com.petmily.backend.api.cart.dto.CartResponse;
import com.petmily.backend.api.cart.dto.CartUpdateRequest;
import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.domain.cart.entity.CartItem;
import com.petmily.backend.domain.cart.repository.CartItemRepository;
import com.petmily.backend.domain.product.entity.Product;
import com.petmily.backend.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartResponse getCart(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserIdWithProducts(userId);
        
        List<CartResponse.CartItemInfo> itemInfos = cartItems.stream()
            .map(this::convertToCartItemInfo)
            .collect(Collectors.toList());
        
        return buildCartResponse(itemInfos);
    }

    @Transactional
    public void addToCart(Long userId, CartAddRequest request) {
        // 상품 존재 및 활성 상태 확인
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
        
        if (!product.getIsActive()) {
            throw new CustomException(ErrorCode.PRODUCT_INACTIVE);
        }
        
        // 재고 확인
        if (product.getStock() < request.getQuantity()) {
            throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
        }
        
        // 기존 장바구니 아이템 확인
        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId());
        
        if (existingItem.isPresent()) {
            // 기존 아이템 수량 업데이트
            CartItem cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            
            if (product.getStock() < newQuantity) {
                throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
            }
            
            cartItem.updateQuantity(newQuantity);
        } else {
            // 새 아이템 추가
            CartItem cartItem = CartItem.builder()
                .userId(userId)
                .productId(request.getProductId())
                .quantity(request.getQuantity())
                .isSelected(true)
                .build();
            
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional
    public void updateCartItem(Long itemId, Long userId, CartUpdateRequest request) {
        CartItem cartItem = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new CustomException(ErrorCode.CART_ITEM_NOT_FOUND));
        
        // 사용자 권한 확인
        if (!cartItem.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }
        
        // 상품 재고 확인
        Product product = cartItem.getProduct();
        if (product.getStock() < request.getQuantity()) {
            throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
        }
        
        cartItem.updateQuantity(request.getQuantity());
    }

    @Transactional
    public void removeCartItem(Long itemId, Long userId) {
        CartItem cartItem = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new CustomException(ErrorCode.CART_ITEM_NOT_FOUND));
        
        // 사용자 권한 확인
        if (!cartItem.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }
        
        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void toggleCartItemSelection(Long itemId, Long userId) {
        CartItem cartItem = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new CustomException(ErrorCode.CART_ITEM_NOT_FOUND));
        
        // 사용자 권한 확인
        if (!cartItem.getUserId().equals(userId)) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }
        
        cartItem.toggleSelection();
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    @Transactional
    public void removeSelectedItems(Long userId, List<Long> itemIds) {
        // 사용자의 아이템들인지 확인
        List<CartItem> cartItems = cartItemRepository.findByIdInAndUserId(itemIds, userId);
        
        if (cartItems.size() != itemIds.size()) {
            throw new CustomException(ErrorCode.CART_ITEM_NOT_FOUND);
        }
        
        cartItemRepository.deleteByUserIdAndIdIn(userId, itemIds);
    }

    public int getCartItemCount(Long userId) {
        return cartItemRepository.countByUserId(userId);
    }
    
    // Helper methods
    private CartResponse.CartItemInfo convertToCartItemInfo(CartItem cartItem) {
        Product product = cartItem.getProduct();
        
        Double discountedPrice = product.getPrice();
        if (product.getDiscountRate() > 0) {
            discountedPrice = product.getPrice() * (1 - product.getDiscountRate() / 100.0);
        }
        
        boolean isAvailable = product.getIsActive() && product.getStock() >= cartItem.getQuantity();
        
        return new CartResponse.CartItemInfo(
            cartItem.getId(),
            product.getId(),
            product.getName(),
            product.getImageUrl(),
            product.getBrand(),
            product.getPrice(),
            product.getDiscountRate(),
            discountedPrice,
            cartItem.getQuantity(),
            product.getStock(),
            cartItem.getIsSelected(),
            isAvailable
        );
    }
    
    private CartResponse buildCartResponse(List<CartResponse.CartItemInfo> items) {
        int totalItemCount = items.stream().mapToInt(CartResponse.CartItemInfo::getQuantity).sum();
        int selectedItemCount = items.stream()
            .filter(CartResponse.CartItemInfo::getIsSelected)
            .mapToInt(CartResponse.CartItemInfo::getQuantity)
            .sum();
        
        Double totalPrice = items.stream()
            .mapToDouble(item -> item.getQuantity() * item.getPrice())
            .sum();
        
        Double selectedPrice = items.stream()
            .filter(CartResponse.CartItemInfo::getIsSelected)
            .mapToDouble(item -> item.getQuantity() * item.getDiscountedPrice())
            .sum();
        
        Double totalDiscountAmount = items.stream()
            .filter(CartResponse.CartItemInfo::getIsSelected)
            .mapToDouble(item -> item.getQuantity() * (item.getPrice() - item.getDiscountedPrice()))
            .sum();
        
        // 배송비 계산 (예: 50000원 이상 무료배송)
        Double deliveryFee = selectedPrice >= 50000 ? 0.0 : 3000.0;
        Double finalPrice = selectedPrice + deliveryFee;
        
        return new CartResponse(
            items,
            totalItemCount,
            selectedItemCount,
            totalPrice,
            selectedPrice,
            totalDiscountAmount,
            deliveryFee,
            finalPrice
        );
    }
}