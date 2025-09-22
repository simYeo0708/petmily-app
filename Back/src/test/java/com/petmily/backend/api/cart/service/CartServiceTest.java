package com.petmily.backend.api.cart.service;

import com.petmily.backend.api.cart.dto.CartAddRequest;
import com.petmily.backend.api.cart.dto.CartResponse;
import com.petmily.backend.api.cart.dto.CartUpdateRequest;
import com.petmily.backend.domain.cart.entity.CartItem;
import com.petmily.backend.domain.cart.repository.CartItemRepository;
import com.petmily.backend.domain.product.entity.Product;
import com.petmily.backend.domain.product.repository.ProductRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    private User mockUser;
    private Product mockProduct;
    private CartItem mockCartItem;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .build();

        mockProduct = Product.builder()
                .id(1L)
                .name("테스트 상품")
                .price(10000.0)
                .stock(100)
                .isActive(true)
                .build();

        mockCartItem = CartItem.builder()
                .id(1L)
                .userId(1L)
                .productId(1L)
                .quantity(2)
                .isSelected(true)
                .build();
    }

    @Test
    void getCart_Success() {
        // Given
        when(cartItemRepository.findByUserIdWithProducts(1L))
                .thenReturn(Arrays.asList(mockCartItem));
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));

        // When
        CartResponse result = cartService.getCart(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getTotalItemCount()).isEqualTo(1);
    }

    @Test
    void addToCart_Success() {
        // Given
        CartAddRequest request = new CartAddRequest();
        request.setProductId(1L);
        request.setQuantity(2);

        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(cartItemRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(mockCartItem);

        // When
        cartService.addToCart(1L, request);

        // Then
        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    void addToCart_ProductAlreadyInCart() {
        // Given
        CartAddRequest request = new CartAddRequest();
        request.setProductId(1L);
        request.setQuantity(2);

        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(cartItemRepository.findByUserIdAndProductId(1L, 1L)).thenReturn(Optional.of(mockCartItem));

        // When
        cartService.addToCart(1L, request);

        // Then
        verify(cartItemRepository).save(mockCartItem);
        assertThat(mockCartItem.getQuantity()).isEqualTo(4); // 기존 2 + 새로 추가 2
    }

    @Test
    void updateCartItem_Success() {
        // Given
        CartUpdateRequest request = new CartUpdateRequest();
        request.setQuantity(5);

        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(mockCartItem));

        // When
        cartService.updateCartItem(1L, 1L, request);

        // Then
        verify(cartItemRepository).save(mockCartItem);
        assertThat(mockCartItem.getQuantity()).isEqualTo(5);
    }

    @Test
    void removeCartItem_Success() {
        // Given
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(mockCartItem));

        // When
        cartService.removeCartItem(1L, 1L);

        // Then
        verify(cartItemRepository).delete(mockCartItem);
    }

    @Test
    void toggleCartItemSelection_Success() {
        // Given
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(mockCartItem));
        boolean originalSelection = mockCartItem.getIsSelected();

        // When
        cartService.toggleCartItemSelection(1L, 1L);

        // Then
        verify(cartItemRepository).save(mockCartItem);
        assertThat(mockCartItem.getIsSelected()).isEqualTo(!originalSelection);
    }

    @Test
    void clearCart_Success() {
        // Given
        when(cartItemRepository.findByUserIdWithProducts(1L)).thenReturn(Arrays.asList(mockCartItem));

        // When
        cartService.clearCart(1L);

        // Then
        verify(cartItemRepository).deleteAll(Arrays.asList(mockCartItem));
    }
}