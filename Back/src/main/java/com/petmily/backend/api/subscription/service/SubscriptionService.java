package com.petmily.backend.api.subscription.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.order.service.OrderService;
import com.petmily.backend.api.subscription.dto.*;
import com.petmily.backend.domain.order.entity.*;
import com.petmily.backend.domain.order.repository.*;
import com.petmily.backend.domain.product.entity.Product;
import com.petmily.backend.domain.product.repository.ProductRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final SubscriptionOrderRepository subscriptionOrderRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;

    public SubscriptionListResponse getSubscriptions(Long userId, Pageable pageable) {
        Page<SubscriptionOrder> subscriptions = subscriptionOrderRepository.findByUserIdWithOrder(userId, pageable);
        
        List<SubscriptionListResponse.SubscriptionSummary> summaries = subscriptions.getContent().stream()
            .map(this::convertToSummary)
            .collect(Collectors.toList());
        
        return SubscriptionListResponse.builder()
            .subscriptions(summaries)
            .currentPage(subscriptions.getNumber())
            .totalPages(subscriptions.getTotalPages())
            .totalElements(subscriptions.getTotalElements())
            .hasNext(subscriptions.hasNext())
            .hasPrevious(subscriptions.hasPrevious())
            .build();
    }

    public SubscriptionDetailResponse getSubscription(Long subscriptionId, Long userId) {
        if (!subscriptionOrderRepository.existsByIdAndUserId(subscriptionId, userId)) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND);
        }
        
        SubscriptionOrder subscription = subscriptionOrderRepository.findById(subscriptionId)
            .orElseThrow(() -> new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        
        return convertToDetailResponse(subscription);
    }

    @Transactional
    public SubscriptionDetailResponse createSubscription(Long userId, SubscriptionCreateRequest request) {
        // 1. 사용자 검증
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        // 2. 요청 데이터 검증
        validateSubscriptionRequest(request);
        
        // 3. 상품 및 재고 검증
        List<Product> products = validateSubscriptionProducts(request.getItems());
        
        // 4. 첫 번째 주문 생성 (일반 주문과 동일한 프로세스)
        Order firstOrder = createFirstOrder(userId, request, products);
        
        // 5. 정기배송 설정 생성
        SubscriptionOrder subscription = createSubscriptionOrder(firstOrder, request);
        
        return convertToDetailResponse(subscription);
    }

    @Transactional
    public SubscriptionDetailResponse updateSubscription(Long subscriptionId, Long userId, SubscriptionUpdateRequest request) {
        if (!subscriptionOrderRepository.existsByIdAndUserId(subscriptionId, userId)) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND);
        }
        
        SubscriptionOrder subscription = subscriptionOrderRepository.findById(subscriptionId)
            .orElseThrow(() -> new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        
        if (!subscription.getIsActive()) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_MODIFICATION_NOT_ALLOWED);
        }
        
        // 정기배송 설정 업데이트
        updateSubscriptionSettings(subscription, request);
        
        // 주문 정보 업데이트 (배송지 등)
        if (subscription.getOrder() != null) {
            updateOrderInfo(subscription.getOrder(), request);
        }
        
        subscriptionOrderRepository.save(subscription);
        
        return convertToDetailResponse(subscription);
    }

    @Transactional
    public void pauseSubscription(Long subscriptionId, Long userId, LocalDate pauseUntil) {
        if (!subscriptionOrderRepository.existsByIdAndUserId(subscriptionId, userId)) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND);
        }
        
        SubscriptionOrder subscription = subscriptionOrderRepository.findById(subscriptionId)
            .orElseThrow(() -> new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        
        if (!subscription.getIsActive()) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_CANNOT_PAUSE);
        }
        
        if (subscription.isPaused()) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_ALREADY_PAUSED);
        }
        
        // 일시정지 날짜가 없으면 무기한 일시정지
        LocalDate pauseDate = pauseUntil != null ? pauseUntil : LocalDate.now().plusYears(1);
        
        subscription.pause(pauseDate);
        subscriptionOrderRepository.save(subscription);
    }

    @Transactional
    public void resumeSubscription(Long subscriptionId, Long userId) {
        if (!subscriptionOrderRepository.existsByIdAndUserId(subscriptionId, userId)) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND);
        }
        
        SubscriptionOrder subscription = subscriptionOrderRepository.findById(subscriptionId)
            .orElseThrow(() -> new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        
        if (!subscription.isPaused()) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_ALREADY_ACTIVE);
        }
        
        subscription.resume();
        
        // 다음 배송일 재계산
        LocalDate nextDelivery = subscription.calculateNextDeliveryDate();
        if (nextDelivery.isBefore(LocalDate.now())) {
            nextDelivery = LocalDate.now().plusDays(1);
        }
        subscription.updateNextDeliveryDate(nextDelivery);
        
        subscriptionOrderRepository.save(subscription);
    }

    @Transactional
    public void cancelSubscription(Long subscriptionId, Long userId) {
        if (!subscriptionOrderRepository.existsByIdAndUserId(subscriptionId, userId)) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND);
        }
        
        SubscriptionOrder subscription = subscriptionOrderRepository.findById(subscriptionId)
            .orElseThrow(() -> new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        
        if (!subscription.getIsActive()) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_ALREADY_CANCELLED);
        }
        
        subscription.cancel();
        subscriptionOrderRepository.save(subscription);
    }

    public SubscriptionHistoryResponse getSubscriptionHistory(Long subscriptionId, Long userId, Pageable pageable) {
        if (!subscriptionOrderRepository.existsByIdAndUserId(subscriptionId, userId)) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND);
        }
        
        SubscriptionOrder subscription = subscriptionOrderRepository.findById(subscriptionId)
            .orElseThrow(() -> new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        
        // 정기배송과 관련된 모든 주문 조회 (첫 주문 + 자동 생성된 주문들)
        Page<Order> orders = orderRepository.findBySubscriptionIdWithItems(subscriptionId, pageable);
        
        List<SubscriptionHistoryResponse.SubscriptionOrderHistory> orderHistories = orders.getContent().stream()
            .map(this::convertToOrderHistory)
            .collect(Collectors.toList());
        
        // 통계 정보 계산
        return SubscriptionHistoryResponse.builder()
            .orders(orderHistories)
            .currentPage(orders.getNumber())
            .totalPages(orders.getTotalPages())
            .totalElements(orders.getTotalElements())
            .hasNext(orders.hasNext())
            .hasPrevious(orders.hasPrevious())
            .totalDeliveries(subscription.getDeliveryCount())
            .totalAmount(calculateTotalAmount(subscription))
            .averageOrderAmount(calculateAverageOrderAmount(subscription))
            .firstDeliveryDate(subscription.getOrder().getCreateTime().toLocalDate())
            .lastDeliveryDate(getLastDeliveryDate(subscription))
            .build();
    }

    @Scheduled(cron = "0 0 9 * * ?") // 매일 오전 9시 실행
    @Transactional
    public void processScheduledDeliveries() {
        LocalDate today = LocalDate.now();
        
        // 1. 오늘 배송 예정인 정기배송 조회
        List<SubscriptionOrder> dueSubscriptions = subscriptionOrderRepository.findDueForDelivery(today);
        
        for (SubscriptionOrder subscription : dueSubscriptions) {
            try {
                // 2. 자동 주문 생성
                createAutomaticOrder(subscription);
                
                // 3. 배송 횟수 증가 및 다음 배송일 계산
                subscription.incrementDeliveryCount();
                LocalDate nextDelivery = subscription.calculateNextDeliveryDate();
                subscription.updateNextDeliveryDate(nextDelivery);
                
                // 4. 최대 배송 횟수 도달 시 자동 해지
                if (subscription.isCompleted()) {
                    subscription.cancel();
                }
                
                subscriptionOrderRepository.save(subscription);
                
            } catch (Exception e) {
                // 로깅 후 다음 정기배송 처리 계속
                // 실패한 정기배송 알림 처리 (로그 기록)
                continue;
            }
        }
        
        // 5. 완료된 정기배송 일괄 해지
        subscriptionOrderRepository.deactivateCompletedSubscriptions();
    }

    private void validateSubscriptionRequest(SubscriptionCreateRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new CustomException(ErrorCode.SUBSCRIPTION_ITEMS_REQUIRED);
        }
        
        if (request.getFirstDeliveryDate().isBefore(LocalDate.now())) {
            throw new CustomException(ErrorCode.INVALID_FIRST_DELIVERY_DATE);
        }
        
        SubscriptionType type;
        try {
            type = SubscriptionType.valueOf(request.getSubscriptionType());
        } catch (IllegalArgumentException e) {
            throw new CustomException(ErrorCode.INVALID_SUBSCRIPTION_TYPE);
        }
        
        if (type == SubscriptionType.CUSTOM && 
            (request.getDeliveryIntervalDays() == null || request.getDeliveryIntervalDays() < 1)) {
            throw new CustomException(ErrorCode.INVALID_DELIVERY_INTERVAL);
        }
    }
    
    private List<Product> validateSubscriptionProducts(List<SubscriptionCreateRequest.SubscriptionItem> items) {
        List<Long> productIds = items.stream()
            .map(SubscriptionCreateRequest.SubscriptionItem::getProductId)
            .collect(Collectors.toList());
        
        List<Product> products = productRepository.findAllById(productIds);
        
        if (products.size() != items.size()) {
            throw new CustomException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        
        for (Product product : products) {
            if (!product.isActive()) {
                throw new CustomException(ErrorCode.PRODUCT_NOT_AVAILABLE);
            }
        }
        
        return products;
    }
    
    private Order createFirstOrder(Long userId, SubscriptionCreateRequest request, List<Product> products) {
        // OrderService를 사용하여 첫 주문 생성
        // 여기서는 간단히 Order 엔티티만 생성
        Order order = Order.builder()
            .userId(userId)
            .receiverName(request.getReceiverName())
            .receiverPhone(request.getReceiverPhone())
            .shippingAddress(request.getShippingAddress())
            .deliveryMemo(request.getDeliveryMemo())
            .paymentMethod(request.getPaymentMethod())
            .isSubscription(true)
            .build();
        
        return orderRepository.save(order);
    }
    
    private SubscriptionOrder createSubscriptionOrder(Order order, SubscriptionCreateRequest request) {
        SubscriptionOrder subscription = SubscriptionOrder.builder()
            .orderId(order.getId())
            .subscriptionType(SubscriptionType.valueOf(request.getSubscriptionType()))
            .deliveryIntervalDays(request.getDeliveryIntervalDays())
            .nextDeliveryDate(request.getFirstDeliveryDate())
            .maxDeliveries(request.getMaxDeliveries())
            .isActive(true)
            .deliveryCount(0)
            .build();
        
        return subscriptionOrderRepository.save(subscription);
    }
    
    private void createAutomaticOrder(SubscriptionOrder subscription) {
        Order originalOrder = subscription.getOrder();
        if (originalOrder == null) return;
        
        // 원본 주문을 기반으로 새 주문 생성
        Order newOrder = Order.builder()
            .userId(originalOrder.getUserId())
            .receiverName(originalOrder.getReceiverName())
            .receiverPhone(originalOrder.getReceiverPhone())
            .shippingAddress(originalOrder.getShippingAddress())
            .deliveryMemo(originalOrder.getDeliveryMemo())
            .paymentMethod(originalOrder.getPaymentMethod())
            .isSubscription(true)
            .build();
        
        orderRepository.save(newOrder);
        
        // 주문 아이템도 복사
        List<OrderItem> originalItems = originalOrder.getItems();
        if (originalItems != null) {
            List<OrderItem> newItems = originalItems.stream()
                .map(item -> OrderItem.builder()
                    .orderId(newOrder.getId())
                    .productId(item.getProductId())
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .build())
                .collect(Collectors.toList());
            
            orderItemRepository.saveAll(newItems);
        }
    }
    
    private void updateSubscriptionSettings(SubscriptionOrder subscription, SubscriptionUpdateRequest request) {
        if (request.getSubscriptionType() != null) {
            subscription.setSubscriptionType(SubscriptionType.valueOf(request.getSubscriptionType()));
        }
        
        if (request.getDeliveryIntervalDays() != null) {
            subscription.setDeliveryIntervalDays(request.getDeliveryIntervalDays());
        }
        
        if (request.getNextDeliveryDate() != null) {
            subscription.setNextDeliveryDate(request.getNextDeliveryDate());
        }
        
        if (request.getMaxDeliveries() != null) {
            subscription.setMaxDeliveries(request.getMaxDeliveries());
        }
    }
    
    private void updateOrderInfo(Order order, SubscriptionUpdateRequest request) {
        if (request.getReceiverName() != null) {
            order.setReceiverName(request.getReceiverName());
        }
        
        if (request.getReceiverPhone() != null) {
            order.setReceiverPhone(request.getReceiverPhone());
        }
        
        if (request.getShippingAddress() != null) {
            order.setShippingAddress(request.getShippingAddress());
        }
        
        if (request.getDeliveryMemo() != null) {
            order.setDeliveryMemo(request.getDeliveryMemo());
        }
        
        if (request.getPaymentMethod() != null) {
            order.setPaymentMethod(request.getPaymentMethod());
        }
        
        orderRepository.save(order);
    }
    
    private SubscriptionListResponse.SubscriptionSummary convertToSummary(SubscriptionOrder subscription) {
        Order order = subscription.getOrder();
        
        return SubscriptionListResponse.SubscriptionSummary.builder()
            .id(subscription.getId())
            .subscriptionType(subscription.getSubscriptionType().name())
            .nextDeliveryDate(subscription.getNextDeliveryDate())
            .deliveryIntervalDays(subscription.getDeliveryIntervalDays())
            .isActive(subscription.getIsActive())
            .pauseUntil(subscription.getPauseUntil())
            .deliveryCount(subscription.getDeliveryCount())
            .maxDeliveries(subscription.getMaxDeliveries())
            .createTime(subscription.getCreateTime())
            .firstProductName(getFirstProductName(order))
            .firstProductImage(getFirstProductImage(order))
            .totalItemCount(getTotalItemCount(order))
            .monthlyAmount(calculateMonthlyAmount(subscription))
            .lastOrderDate(order != null ? order.getCreateTime() : null)
            .lastOrderStatus(order != null ? order.getStatus().name() : null)
            .build();
    }
    
    private SubscriptionDetailResponse convertToDetailResponse(SubscriptionOrder subscription) {
        Order order = subscription.getOrder();
        
        return SubscriptionDetailResponse.builder()
            .id(subscription.getId())
            .subscriptionType(subscription.getSubscriptionType().name())
            .deliveryIntervalDays(subscription.getDeliveryIntervalDays())
            .nextDeliveryDate(subscription.getNextDeliveryDate())
            .isActive(subscription.getIsActive())
            .pauseUntil(subscription.getPauseUntil())
            .deliveryCount(subscription.getDeliveryCount())
            .maxDeliveries(subscription.getMaxDeliveries())
            .createTime(subscription.getCreateTime())
            .receiverName(order != null ? order.getReceiverName() : null)
            .receiverPhone(order != null ? order.getReceiverPhone() : null)
            .shippingAddress(order != null ? order.getShippingAddress() : null)
            .deliveryMemo(order != null ? order.getDeliveryMemo() : null)
            .paymentMethod(order != null ? order.getPaymentMethod() : null)
            .items(buildSubscriptionItems(order))
            .monthlyAmount(calculateMonthlyAmount(subscription))
            .totalSavedAmount(calculateTotalSavedAmount(subscription))
            .totalOrders(subscription.getDeliveryCount())
            .lastOrderDate(order != null ? order.getCreateTime() : null)
            .nextPauseAvailableDate(LocalDateTime.now().plusDays(1))
            .build();
    }
    
    private SubscriptionHistoryResponse.SubscriptionOrderHistory convertToOrderHistory(Order order) {
        return SubscriptionHistoryResponse.SubscriptionOrderHistory.builder()
            .orderId(order.getId())
            .deliveryDate(order.getCreateTime().toLocalDate())
            .orderStatus(order.getStatus().name())
            .deliveryStatus(order.getDeliveryStatus() != null ? order.getDeliveryStatus().name() : null)
            .orderAmount(order.getFinalAmount())
            .trackingNumber(order.getTrackingNumber())
            .orderTime(order.getCreateTime())
            .deliveredTime(order.getUpdateTime())
            .items(buildOrderItemInfos(order.getItems()))
            .receiverName(order.getReceiverName())
            .shippingAddress(order.getShippingAddress())
            .deliveryMemo(order.getDeliveryMemo())
            .build();
    }
    
    // Helper methods
    private String getFirstProductName(Order order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            return null;
        }
        OrderItem firstItem = order.getItems().get(0);
        return firstItem.getProduct() != null ? firstItem.getProduct().getName() : null;
    }
    
    private String getFirstProductImage(Order order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            return null;
        }
        OrderItem firstItem = order.getItems().get(0);
        return firstItem.getProduct() != null ? firstItem.getProduct().getImageUrl() : null;
    }
    
    private int getTotalItemCount(Order order) {
        if (order == null || order.getItems() == null) {
            return 0;
        }
        return order.getItems().size();
    }
    
    private Double calculateMonthlyAmount(SubscriptionOrder subscription) {
        Order order = subscription.getOrder();
        if (order == null || order.getFinalAmount() == null) {
            return 0.0;
        }
        
        // 월 기준으로 환산
        SubscriptionType type = subscription.getSubscriptionType();
        switch (type) {
            case WEEKLY:
                return order.getFinalAmount().doubleValue() * 4;
            case BIWEEKLY:
                return order.getFinalAmount().doubleValue() * 2;
            case MONTHLY:
                return order.getFinalAmount().doubleValue();
            case CUSTOM:
                if (subscription.getDeliveryIntervalDays() != null) {
                    return order.getFinalAmount().doubleValue() * (30.0 / subscription.getDeliveryIntervalDays());
                }
                return order.getFinalAmount().doubleValue();
            default:
                return order.getFinalAmount().doubleValue();
        }
    }
    
    private Double calculateTotalSavedAmount(SubscriptionOrder subscription) {
        // 정기배송 할인 혜택 계산 (예: 10% 할인)
        Double monthlyAmount = calculateMonthlyAmount(subscription);
        return monthlyAmount * 0.1 * subscription.getDeliveryCount();
    }
    
    private BigDecimal calculateTotalAmount(SubscriptionOrder subscription) {
        Order order = subscription.getOrder();
        if (order == null || order.getFinalAmount() == null) {
            return BigDecimal.ZERO;
        }
        return order.getFinalAmount().multiply(BigDecimal.valueOf(subscription.getDeliveryCount()));
    }
    
    private BigDecimal calculateAverageOrderAmount(SubscriptionOrder subscription) {
        Order order = subscription.getOrder();
        if (order == null || order.getFinalAmount() == null) {
            return BigDecimal.ZERO;
        }
        return order.getFinalAmount();
    }
    
    private LocalDate getLastDeliveryDate(SubscriptionOrder subscription) {
        // 가장 최근 배송일 조회 (실제로는 주문 이력에서 조회)
        return subscription.getUpdateTime().toLocalDate();
    }
    
    private List<SubscriptionDetailResponse.SubscriptionItemInfo> buildSubscriptionItems(Order order) {
        if (order == null || order.getItems() == null) {
            return List.of();
        }
        
        return order.getItems().stream()
            .map(item -> SubscriptionDetailResponse.SubscriptionItemInfo.builder()
                .productId(item.getProductId())
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .productImage(item.getProduct() != null ? item.getProduct().getImageUrl() : null)
                .brand(item.getProduct() != null ? item.getProduct().getBrand() : null)
                .price(item.getPrice() != null ? item.getPrice().doubleValue() : 0.0)
                .discountRate(0.1) // 정기배송 할인율
                .discountedPrice(item.getPrice() != null ? item.getPrice().doubleValue() * 0.9 : 0.0)
                .quantity(item.getQuantity())
                .totalPrice(item.getPrice() != null ? item.getPrice().doubleValue() * item.getQuantity() * 0.9 : 0.0)
                .isAvailable(item.getProduct() != null ? item.getProduct().isActive() : false)
                .build())
            .collect(Collectors.toList());
    }
    
    private List<SubscriptionHistoryResponse.OrderItemInfo> buildOrderItemInfos(List<OrderItem> items) {
        if (items == null) {
            return List.of();
        }
        
        return items.stream()
            .map(item -> SubscriptionHistoryResponse.OrderItemInfo.builder()
                .productId(item.getProductId())
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .productImage(item.getProduct() != null ? item.getProduct().getImageUrl() : null)
                .brand(item.getProduct() != null ? item.getProduct().getBrand() : null)
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .totalPrice(item.getPrice() != null ? item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())) : BigDecimal.ZERO)
                .build())
            .collect(Collectors.toList());
    }
}