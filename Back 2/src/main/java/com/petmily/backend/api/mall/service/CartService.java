package com.petmily.backend.api.mall.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.mall.dto.cart.request.CartAddRequest;
import com.petmily.backend.api.mall.dto.cart.response.CartResponse;
import com.petmily.backend.domain.mall.cart.entity.Cart;
import com.petmily.backend.domain.mall.cart.repository.CartRepository;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.repository.ProductRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    private Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    private Cart getCartById(Long cartId) {
        return cartRepository.findById(cartId)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND));
    }

    @Transactional
    public CartResponse addToCart(Long userId, CartAddRequest request) {
        User user = getUserById(userId);
        Product product = getProductById(request.getProductId());

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
        }

        Cart cart = cartRepository.findByUserAndProduct(user, product)
                .orElse(null);

        if(cart != null) {
            cart.incrementQuantity(request.getQuantity());
        } else {
            cart = Cart.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartRepository.save(cart);
        }

        return CartResponse.from(cart);
    }

    public List<CartResponse> getCart(Long userId) {
        User user = getUserById(userId);
        List<Cart> carts = cartRepository.findByUser(user);
        return carts.stream()
                .map(CartResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartResponse updateQuantity(Long userId, Long cartId, Integer quantity) {
        User user = getUserById(userId);
        Cart cart = getCartById(cartId);

        if(!cart.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        if(cart.getProduct().getStockQuantity() < quantity) {
            throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
        }

        cart.updateQuantity(quantity);
        return CartResponse.from(cart);
    }

    @Transactional
    public void removeFromCart(Long userId, Long cartId) {
        User user = getUserById(userId);
        Cart cart = getCartById(cartId);

        if(!cart.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        cartRepository.delete(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        User user = getUserById(userId);
        cartRepository.deleteAllByUser(user);
    }

}
