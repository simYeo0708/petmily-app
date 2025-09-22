package com.petmily.backend.api.subscription.service;

import com.petmily.backend.api.subscription.dto.*;
import com.petmily.backend.domain.order.entity.SubscriptionOrder;
import com.petmily.backend.domain.order.entity.SubscriptionType;
import com.petmily.backend.domain.order.repository.SubscriptionOrderRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock
    private SubscriptionOrderRepository subscriptionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SubscriptionService subscriptionService;

    private User mockUser;
    private Product mockProduct;
    private SubscriptionOrder mockSubscription;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .build();

        mockProduct = Product.builder()
                .id(1L)
                .name("구독용 사료")
                .price(30000.0)
                .stock(100)
                .isActive(true)
                .build();

        mockSubscription = SubscriptionOrder.builder()
                .id(1L)
                .orderId(1L)
                .subscriptionType(SubscriptionType.MONTHLY)
                .deliveryIntervalDays(30)
                .nextDeliveryDate(LocalDate.now().plusDays(30))
                .isActive(true)
                .build();
    }

    @Test
    void getSubscriptions_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<SubscriptionOrder> subscriptionPage = new PageImpl<>(Arrays.asList(mockSubscription), pageable, 1);
        
        when(subscriptionRepository.findAll(any(Pageable.class)))
                .thenReturn(subscriptionPage);
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));

        // When
        SubscriptionListResponse result = subscriptionService.getSubscriptions(1L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getSubscriptions()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getCurrentPage()).isEqualTo(0);
    }

    @Test
    void getSubscription_Success() {
        // Given
        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(mockSubscription));
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));

        // When
        SubscriptionDetailResponse result = subscriptionService.getSubscription(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getSubscriptionType()).isEqualTo("MONTHLY");
        assertThat(result.getDeliveryIntervalDays()).isEqualTo(30);
        assertThat(result.getIsActive()).isTrue();
    }

    @Test
    void createSubscription_Success() {
        // Given
        SubscriptionCreateRequest request = new SubscriptionCreateRequest();
        SubscriptionCreateRequest.SubscriptionItem item = new SubscriptionCreateRequest.SubscriptionItem();
        item.setProductId(1L);
        item.setQuantity(1);
        request.setItems(Arrays.asList(item));
        request.setSubscriptionType("MONTHLY");
        request.setDeliveryIntervalDays(30);
        request.setFirstDeliveryDate(LocalDate.now().plusDays(1));

        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(subscriptionRepository.save(any(SubscriptionOrder.class))).thenReturn(mockSubscription);

        // When
        SubscriptionDetailResponse result = subscriptionService.createSubscription(1L, request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getSubscriptionType()).isEqualTo("MONTHLY");
        verify(subscriptionRepository).save(any(SubscriptionOrder.class));
    }

    @Test
    void updateSubscription_Success() {
        // Given
        SubscriptionUpdateRequest request = new SubscriptionUpdateRequest();
        request.setDeliveryIntervalDays(60);

        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(mockSubscription));

        // When
        SubscriptionDetailResponse result = subscriptionService.updateSubscription(1L, 1L, request);

        // Then
        assertThat(result).isNotNull();
        assertThat(mockSubscription.getDeliveryIntervalDays()).isEqualTo(60);
        verify(subscriptionRepository).save(mockSubscription);
    }

    @Test
    void pauseSubscription_Success() {
        // Given
        LocalDate pauseUntil = LocalDate.now().plusDays(30);
        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(mockSubscription));

        // When
        subscriptionService.pauseSubscription(1L, 1L, pauseUntil);

        // Then
        assertThat(mockSubscription.getIsActive()).isFalse();
        assertThat(mockSubscription.getPauseUntil()).isEqualTo(pauseUntil);
        verify(subscriptionRepository).save(mockSubscription);
    }

    @Test
    void resumeSubscription_Success() {
        // Given
        mockSubscription.pause(LocalDate.now().plusDays(10));
        
        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(mockSubscription));

        // When
        subscriptionService.resumeSubscription(1L, 1L);

        // Then
        assertThat(mockSubscription.getIsActive()).isTrue();
        assertThat(mockSubscription.getPauseUntil()).isNull();
        verify(subscriptionRepository).save(mockSubscription);
    }

    @Test
    void cancelSubscription_Success() {
        // Given
        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(mockSubscription));

        // When
        subscriptionService.cancelSubscription(1L, 1L);

        // Then
        assertThat(mockSubscription.getIsActive()).isFalse();
        verify(subscriptionRepository).save(mockSubscription);
    }

    @Test
    void cancelSubscription_AlreadyCancelled() {
        // Given
        mockSubscription.cancel();
        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(mockSubscription));

        // When & Then
        assertThatThrownBy(() -> subscriptionService.cancelSubscription(1L, 1L))
                .isInstanceOf(RuntimeException.class);
    }
}