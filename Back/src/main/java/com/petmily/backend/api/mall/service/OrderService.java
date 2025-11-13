package com.petmily.backend.api.mall.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.mall.dto.order.request.OrderCreateRequest;
import com.petmily.backend.api.mall.dto.order.request.OrderItemRequest;
import com.petmily.backend.api.mall.dto.order.response.OrderResponse;
import com.petmily.backend.api.notification.service.NotificationService;
import com.petmily.backend.domain.mall.order.entity.DeliveryInfo;
import com.petmily.backend.domain.mall.order.entity.Order;
import com.petmily.backend.domain.mall.order.entity.OrderItem;
import com.petmily.backend.domain.mall.order.entity.OrderStatus;
import com.petmily.backend.domain.mall.order.repository.OrderRepository;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.repository.ProductRepository;
import com.petmily.backend.domain.mall.subscription.entity.Subscription;
import com.petmily.backend.domain.mall.subscription.entity.SubscriptionCycle;
import com.petmily.backend.domain.mall.subscription.entity.SubscriptionStatus;
import com.petmily.backend.domain.mall.subscription.repository.SubscriptionRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SubscriptionRepository subscriptionRepository;

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    private Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    private Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
    }

    @Transactional
    public OrderResponse createOrder(Long userId, OrderCreateRequest request) {
        User user = getUserById(userId);

        if (Boolean.TRUE.equals(request.getIsSubscription())) {
            validateSubscriptionOrder(request);
        }

        String orderNumber = generateOrderNumber();

        DeliveryInfo deliveryInfo = DeliveryInfo.builder()
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryMessage(request.getDeliveryMessage())
                .build();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .status(OrderStatus.PENDING)
                .deliveryInfo(deliveryInfo)
                .orderedAt(LocalDateTime.now())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = getProductById(itemRequest.getProductId());

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
            }

            product.decreaseStock(itemRequest.getQuantity());

            BigDecimal itemPrice = product.getPrice();
            if (Boolean.TRUE.equals(request.getIsSubscription()) &&
                product.getSubscriptionInitialDiscount() != null) {
                BigDecimal discountRate = product.getSubscriptionInitialDiscount();
                itemPrice = itemPrice.multiply(BigDecimal.ONE.subtract(discountRate));
            }

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .price(itemPrice)
                    .build();
            orderItem.calculateTotalPrice();

            order.addOrderItem(orderItem);
            totalAmount = totalAmount.add(orderItem.getTotalPrice());
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        if(Boolean.TRUE.equals(request.getIsSubscription())) {
            Subscription subscription = createSubscription(user, request, deliveryInfo);
            savedOrder.setSubscription(subscription);
        }

        notificationService.sendOrderCreatedNotification(savedOrder);

        return OrderResponse.from(savedOrder);
    }

    public Page<OrderResponse> getOrders(Long userId, OrderStatus status, Pageable pageable) {
        User user = getUserById(userId);

        Page<Order> orders;
        if (status != null) {
            orders = orderRepository.findByUserAndStatus(user, status, pageable);
        } else {
            orders = orderRepository.findByUser(user, pageable);
        }
        return orders.map(OrderResponse::from);
    }

    public OrderResponse getOrder(Long userId, Long orderId) {
        User user = getUserById(userId);
        Order order = getOrderById(orderId);

        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, Long orderId, String reason) {
        User user = getUserById(userId);
        Order order = getOrderById(orderId);

        if (!order.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        if (order.getStatus() == OrderStatus.SHIPPED ||
            order.getStatus() == OrderStatus.DELIVERED ||
            order.getStatus() == OrderStatus.CANCELED) {
            throw new IllegalArgumentException("취소할 수 없는 주문 상태입니다.");
        }

        for(OrderItem orderItem : order.getOrderItems()) {
            Product product = orderItem.getProduct();
            product.increaseStock(orderItem.getQuantity());
        }

        order.updateStatus(OrderStatus.CANCELED);
        order.setCancelReason(reason);

        return OrderResponse.from(order);
    }

    public Page<OrderResponse> getSellerOrders(Long userId, Pageable pageable) {
        User seller = getUserById(userId);
        Page<Order> orders = orderRepository.findOrdersBySeller(seller, pageable);
        return orders.map(OrderResponse::from);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long userId, Long orderId, OrderStatus newStatus) {
        User user = getUserById(userId);
        Order order = getOrderById(orderId);

        boolean isAuthorized = user.getRole().name().equals("ADMIN") ||
                order.getOrderItems().stream()
                        .anyMatch(item -> item.getProduct().getSeller().getId().equals(user.getId()));

        if(!isAuthorized) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        order.updateStatus(newStatus);

        notificationService.sendOrderStatusNotification(order, newStatus);

        return OrderResponse.from(order);
    }

    private String generateOrderNumber() {
        String date = LocalDateTime.now().toString().substring(0, 10).replace("-", "");
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "ORD-" + date + "-" + uuid;
    }

    private void validateSubscriptionOrder(OrderCreateRequest request) {
        if(request.getItems().size() != 1) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_MULTIPLE_ITEMS_NOT_ALLOWED);
        }

        if(request.getSubscriptionCycle() == null) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_CYCLE_REQUIRED);
        }

        OrderItemRequest item = request.getItems().get(0);
        Product product = getProductById(item.getProductId());

        if(!Boolean.TRUE.equals(product.getSubscriptionEnabled())) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_NOT_AVAILABLE);
        }

        if(!product.getAvailableSubscriptionCycles().contains(request.getSubscriptionCycle())) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_CYCLE_NOT_AVAILABLE);
        }
    }

    private Subscription createSubscription(User user, OrderCreateRequest request, DeliveryInfo deliveryInfo) {
        OrderItemRequest item = request.getItems().get(0);
        Product product = getProductById(item.getProductId());

        LocalDate nextDeliveryDate = calculateNextDeliveryDate(LocalDate.now(), request.getSubscriptionCycle());

        Subscription subscription = Subscription.builder()
                .user(user)
                .product(product)
                .quantity(item.getQuantity())
                .cycle(request.getSubscriptionCycle())
                .nextDeliveryDate(nextDeliveryDate)
                .status(SubscriptionStatus.ACTIVE)
                .deliveryInfo(deliveryInfo)
                .build();

        return subscriptionRepository.save(subscription);
    }

    private LocalDate calculateNextDeliveryDate(LocalDate from, SubscriptionCycle cycle) {
        return switch (cycle) {
            case WEEKLY -> from.plusWeeks(1);
            case BIWEEKLY -> from.plusWeeks(2);
            case MONTHLY -> from.plusMonths(1);
        };
    }


}
