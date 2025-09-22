package com.petmily.backend.api.order.service;

import com.petmily.backend.api.order.dto.OrderCreateRequest;
import com.petmily.backend.api.order.dto.OrderDetailResponse;
import com.petmily.backend.api.order.dto.OrderListResponse;
import com.petmily.backend.domain.order.entity.Order;
import com.petmily.backend.domain.order.entity.OrderItem;
import com.petmily.backend.domain.order.entity.OrderStatus;
import com.petmily.backend.domain.order.repository.OrderRepository;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderService orderService;

    private User mockUser;
    private Product mockProduct;
    private Order mockOrder;
    private OrderItem mockOrderItem;

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

        mockOrderItem = OrderItem.builder()
                .id(1L)
                .productId(1L)
                .quantity(2)
                .price(BigDecimal.valueOf(10000))
                .build();

        mockOrder = Order.builder()
                .id(1L)
                .userId(1L)
                .totalAmount(BigDecimal.valueOf(20000))
                .status(OrderStatus.PENDING)
                .shippingAddress("서울시 강남구")
                .build();
    }

    @Test
    void getOrders_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> orderPage = new PageImpl<>(Arrays.asList(mockOrder), pageable, 1);
        
        when(orderRepository.findByUserIdWithItems(eq(1L), any(Pageable.class)))
                .thenReturn(orderPage);

        // When
        OrderListResponse result = orderService.getOrders(1L, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getOrders()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getCurrentPage()).isEqualTo(0);
    }

    @Test
    void getOrder_Success() {
        // Given
        when(orderRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(mockOrder));

        // When
        OrderDetailResponse result = orderService.getOrder(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTotalAmount()).isEqualTo(BigDecimal.valueOf(20000));
        assertThat(result.getStatus()).isEqualTo(OrderStatus.PENDING);
    }

    @Test
    void createOrder_Success() {
        // Given
        OrderCreateRequest request = new OrderCreateRequest();
        request.setShippingAddress("서울시 강남구");

        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);

        // When
        OrderDetailResponse result = orderService.createOrder(1L, request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getShippingAddress()).isEqualTo("서울시 강남구");
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void cancelOrder_Success() {
        // Given
        when(orderRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(mockOrder));

        // When
        orderService.cancelOrder(1L, 1L);

        // Then
        assertThat(mockOrder.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        verify(orderRepository).save(mockOrder);
    }

    @Test
    void cancelOrder_AlreadyCancelled() {
        // Given
        mockOrder.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(mockOrder));

        // When & Then
        assertThatThrownBy(() -> orderService.cancelOrder(1L, 1L))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void updateOrderStatus_Success() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        // When
        orderService.updateOrderStatus(1L, "SHIPPED");

        // Then
        assertThat(mockOrder.getStatus()).isEqualTo(OrderStatus.SHIPPED);
        verify(orderRepository).save(mockOrder);
    }

    @Test
    void updateOrderStatus_InvalidStatus() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        // When & Then
        assertThatThrownBy(() -> orderService.updateOrderStatus(1L, "INVALID_STATUS"))
                .isInstanceOf(RuntimeException.class);
    }
}