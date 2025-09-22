package com.petmily.backend.api.order.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.order.dto.*;
import com.petmily.backend.domain.order.entity.*;
import com.petmily.backend.domain.order.repository.*;
import com.petmily.backend.domain.cart.entity.CartItem;
import com.petmily.backend.domain.cart.repository.CartItemRepository;
import com.petmily.backend.domain.product.entity.Product;
import com.petmily.backend.domain.product.repository.ProductRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReturnRepository returnRepository;
    private final ReturnItemRepository returnItemRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewHelpfulRepository reviewHelpfulRepository;
    
    private static final BigDecimal DELIVERY_FEE_THRESHOLD = BigDecimal.valueOf(50000);
    private static final BigDecimal DEFAULT_DELIVERY_FEE = BigDecimal.valueOf(3000);
    private static final int RETURN_PERIOD_DAYS = 7;
    private static final int REVIEW_PERIOD_DAYS = 30;

    public OrderListResponse getOrders(Long userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserIdWithItems(userId, pageable);
        
        List<OrderDetailResponse> orderResponses = orders.getContent().stream()
            .map(this::convertToDetailResponse)
            .collect(Collectors.toList());
        
        return OrderListResponse.builder()
            .orders(orderResponses)
            .totalElements(orders.getTotalElements())
            .totalPages(orders.getTotalPages())
            .currentPage(orders.getNumber())
            .hasNext(orders.hasNext())
            .hasPrevious(orders.hasPrevious())
            .build();
    }

    public OrderDetailResponse getOrder(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserIdWithItems(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        return convertToDetailResponse(order);
    }

    @Transactional
    public OrderDetailResponse createOrder(Long userId, OrderCreateRequest request) {
        // 1. 사용자 검증
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        // 2. 장바구니 아이템 조회 및 검증
        List<CartItem> cartItems = cartItemRepository.findAllById(request.getCartItemIds());
        if (cartItems.isEmpty()) {
            throw new CustomException(ErrorCode.CART_ITEM_NOT_FOUND);
        }
        
        // 3. 재고 확인 및 상품 정보 검증
        validateStockAndProducts(cartItems);
        
        // 4. 주문 금액 계산
        BigDecimal totalAmount = calculateTotalAmount(cartItems);
        BigDecimal deliveryFee = calculateDeliveryFee(totalAmount);
        BigDecimal discountAmount = BigDecimal.valueOf(request.getDiscountAmount());
        BigDecimal finalAmount = totalAmount.add(deliveryFee).subtract(discountAmount);
        
        // 5. 주문 생성
        Order order = Order.builder()
            .userId(userId)
            .totalAmount(totalAmount)
            .deliveryFee(deliveryFee)
            .discountAmount(discountAmount)
            .finalAmount(finalAmount)
            .receiverName(request.getReceiverName())
            .receiverPhone(request.getReceiverPhone())
            .shippingAddress(request.getShippingAddress())
            .deliveryMemo(request.getDeliveryMemo())
            .paymentMethod(request.getPaymentMethod())
            .isSubscription(request.getIsSubscription())
            .build();
        
        Order savedOrder = orderRepository.save(order);
        
        // 6. 주문 아이템 생성
        List<OrderItem> orderItems = cartItems.stream()
            .map(cartItem -> OrderItem.builder()
                .orderId(savedOrder.getId())
                .productId(cartItem.getProductId())
                .quantity(cartItem.getQuantity())
                .price(BigDecimal.valueOf(cartItem.getProduct().getPrice()))
                .build())
            .collect(Collectors.toList());
        
        orderItemRepository.saveAll(orderItems);
        
        // 7. 재고 차감
        decreaseProductStock(cartItems);
        
        // 8. 장바구니에서 주문된 아이템 제거
        cartItemRepository.deleteAll(cartItems);
        
        // 9. 주문 정보 다시 조회 (연관관계 포함)
        Order orderWithItems = orderRepository.findByIdAndUserIdWithItems(savedOrder.getId(), userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        return convertToDetailResponse(orderWithItems);
    }

    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserIdWithItems(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        if (!order.canCancel()) {
            throw new CustomException(ErrorCode.ORDER_CANNOT_CANCEL);
        }
        
        // 재고 복구
        restoreProductStock(order.getItems());
        
        // 주문 취소
        order.cancel();
        
        orderRepository.save(order);
    }

    public TrackingResponse getOrderTracking(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        return TrackingResponse.builder()
            .orderId(order.getId())
            .trackingNumber(order.getTrackingNumber())
            .currentStatus(order.getDeliveryStatus())
            .lastUpdated(order.getUpdateTime())
            .receiverName(order.getReceiverName())
            .shippingAddress(order.getShippingAddress())
            .build();
    }

    @Transactional
    public void confirmOrder(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        order.confirm();
        orderRepository.save(order);
    }

    @Transactional
    public void updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(orderStatus);
            orderRepository.save(order);
        } catch (IllegalArgumentException e) {
            throw new CustomException(ErrorCode.INVALID_ORDER_STATUS);
        }
    }

    @Transactional
    public void updateDeliveryStatus(Long orderId, String deliveryStatus, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        try {
            DeliveryStatus status = DeliveryStatus.valueOf(deliveryStatus.toUpperCase());
            order.setDeliveryStatus(status);
            
            if (trackingNumber != null && !trackingNumber.trim().isEmpty()) {
                order.setTrackingNumber(trackingNumber);
            }
            
            // 배송 완료 시 주문 상태도 업데이트
            if (status == DeliveryStatus.DELIVERED) {
                order.setStatus(OrderStatus.DELIVERED);
            }
            
            orderRepository.save(order);
        } catch (IllegalArgumentException e) {
            throw new CustomException(ErrorCode.INVALID_ORDER_STATUS);
        }
    }

    private BigDecimal calculateTotalAmount(List<CartItem> cartItems) {
        return cartItems.stream()
            .map(CartItem::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private BigDecimal calculateDeliveryFee(BigDecimal totalAmount) {
        return totalAmount.compareTo(DELIVERY_FEE_THRESHOLD) >= 0 ? BigDecimal.ZERO : DEFAULT_DELIVERY_FEE;
    }
    
    private void validateStockAndProducts(List<CartItem> cartItems) {
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product == null) {
                throw new CustomException(ErrorCode.PRODUCT_NOT_FOUND);
            }
            if (!product.isActive()) {
                throw new CustomException(ErrorCode.PRODUCT_NOT_AVAILABLE);
            }
            if (product.getStock() < cartItem.getQuantity()) {
                throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
            }
        }
    }
    
    private void decreaseProductStock(List<CartItem> cartItems) {
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            product.decreaseStock(cartItem.getQuantity());
            productRepository.save(product);
        }
    }
    
    private void restoreProductStock(List<OrderItem> orderItems) {
        for (OrderItem orderItem : orderItems) {
            Product product = orderItem.getProduct();
            if (product != null) {
                product.increaseStock(orderItem.getQuantity());
                productRepository.save(product);
            }
        }
    }
    
    private OrderDetailResponse convertToDetailResponse(Order order) {
        return OrderDetailResponse.builder()
            .id(order.getId())
            .userId(order.getUserId())
            .totalAmount(order.getTotalAmount())
            .discountAmount(order.getDiscountAmount())
            .deliveryFee(order.getDeliveryFee())
            .finalAmount(order.getFinalAmount())
            .status(order.getStatus())
            .deliveryStatus(order.getDeliveryStatus())
            .receiverName(order.getReceiverName())
            .receiverPhone(order.getReceiverPhone())
            .shippingAddress(order.getShippingAddress())
            .deliveryMemo(order.getDeliveryMemo())
            .trackingNumber(order.getTrackingNumber())
            .paymentMethod(order.getPaymentMethod())
            .isSubscription(order.getIsSubscription())
            .createTime(order.getCreateTime())
            .updateTime(order.getUpdateTime())
            .build();
    }

    // ==================== 반품 관련 메소드 ====================

    public ReturnListResponse getOrderReturns(Long orderId, Long userId, Pageable pageable) {
        // 주문 권한 확인
        orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        List<Return> returns = returnRepository.findByOrderIdAndUserId(orderId, userId);
        
        List<ReturnDetailResponse> returnResponses = returns.stream()
            .map(this::convertToReturnDetailResponse)
            .collect(Collectors.toList());
        
        return ReturnListResponse.builder()
            .returns(returnResponses)
            .totalElements((long) returns.size())
            .totalPages(1)
            .currentPage(0)
            .hasNext(false)
            .hasPrevious(false)
            .build();
    }

    public ReturnDetailResponse getOrderReturn(Long orderId, Long returnId, Long userId) {
        // 주문 권한 확인
        orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        Return returnRequest = returnRepository.findByIdAndUserIdWithItems(returnId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.RETURN_NOT_FOUND));
        
        // 반품이 해당 주문에 속하는지 확인
        if (!returnRequest.getOrderId().equals(orderId)) {
            throw new CustomException(ErrorCode.RETURN_NOT_FOUND);
        }
        
        return convertToReturnDetailResponse(returnRequest);
    }

    @Transactional
    public ReturnDetailResponse createReturn(Long orderId, Long userId, ReturnCreateRequest request) {
        // 1. 사용자 검증
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        // 2. 주문 검증
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 3. 반품 가능 조건 검증
        validateReturnEligibility(order);
        
        // 4. 이미 진행 중인 반품이 있는지 확인
        if (returnRepository.hasActiveReturnForOrder(order.getId())) {
            throw new CustomException(ErrorCode.RETURN_ALREADY_EXISTS);
        }
        
        // 5. 반품 아이템 검증
        List<OrderItem> orderItems = validateReturnItems(request.getReturnItems(), order.getId());
        
        // 6. 반품 요청 생성
        Return returnRequest = Return.builder()
            .orderId(order.getId())
            .userId(userId)
            .reason(request.getReason())
            .detailedReason(request.getDetailedReason())
            .collectionAddress(request.getCollectionAddress())
            .build();
        
        Return savedReturn = returnRepository.save(returnRequest);
        
        // 7. 반품 아이템 생성
        List<ReturnItem> returnItems = request.getReturnItems().stream()
            .map(itemRequest -> {
                OrderItem orderItem = orderItems.stream()
                    .filter(oi -> oi.getId().equals(itemRequest.getOrderItemId()))
                    .findFirst()
                    .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
                
                return ReturnItem.builder()
                    .returnId(savedReturn.getId())
                    .orderItemId(orderItem.getId())
                    .productId(orderItem.getProductId())
                    .quantity(itemRequest.getQuantity())
                    .price(orderItem.getPrice())
                    .returnAmount(orderItem.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())))
                    .conditionNote(itemRequest.getConditionNote())
                    .build();
            })
            .collect(Collectors.toList());
        
        returnItemRepository.saveAll(returnItems);
        
        // 8. 반품 금액 계산
        savedReturn.calculateReturnAmount();
        returnRepository.save(savedReturn);
        
        // 9. 반품 정보 다시 조회 (연관관계 포함)
        Return returnWithItems = returnRepository.findByIdAndUserIdWithItems(savedReturn.getId(), userId)
            .orElseThrow(() -> new CustomException(ErrorCode.RETURN_NOT_FOUND));
        
        return convertToReturnDetailResponse(returnWithItems);
    }

    @Transactional
    public void cancelReturn(Long orderId, Long returnId, Long userId) {
        // 주문 권한 확인
        orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        Return returnRequest = returnRepository.findByIdAndUserIdWithItems(returnId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.RETURN_NOT_FOUND));
        
        // 반품이 해당 주문에 속하는지 확인
        if (!returnRequest.getOrderId().equals(orderId)) {
            throw new CustomException(ErrorCode.RETURN_NOT_FOUND);
        }
        
        if (!returnRequest.canCancel()) {
            throw new CustomException(ErrorCode.RETURN_CANNOT_CANCEL);
        }
        
        returnRequest.cancel();
        returnRepository.save(returnRequest);
    }

    @Transactional
    public ReturnDetailResponse approveReturn(Long orderId, Long returnId, ReturnProcessRequest request) {
        Return returnRequest = getReturnForAdmin(orderId, returnId);
        
        returnRequest.approve(request.getMemo());
        returnRepository.save(returnRequest);
        
        return convertToReturnDetailResponse(returnRequest);
    }

    @Transactional
    public ReturnDetailResponse rejectReturn(Long orderId, Long returnId, ReturnProcessRequest request) {
        Return returnRequest = getReturnForAdmin(orderId, returnId);
        
        returnRequest.reject(request.getMemo());
        returnRepository.save(returnRequest);
        
        return convertToReturnDetailResponse(returnRequest);
    }

    @Transactional
    public ReturnDetailResponse collectReturn(Long orderId, Long returnId, ReturnProcessRequest request) {
        Return returnRequest = getReturnForAdmin(orderId, returnId);
        
        returnRequest.collect(request.getTrackingNumber());
        returnRepository.save(returnRequest);
        
        return convertToReturnDetailResponse(returnRequest);
    }

    @Transactional
    public ReturnDetailResponse inspectReturn(Long orderId, Long returnId) {
        Return returnRequest = getReturnForAdmin(orderId, returnId);
        
        returnRequest.inspect();
        returnRepository.save(returnRequest);
        
        return convertToReturnDetailResponse(returnRequest);
    }

    @Transactional
    public ReturnDetailResponse refundReturn(Long orderId, Long returnId, ReturnProcessRequest request) {
        Return returnRequest = getReturnForAdmin(orderId, returnId);
        
        // 재고 복구
        restoreProductStockFromReturn(returnRequest.getReturnItems());
        
        returnRequest.refund(request.getRefundMethod());
        returnRepository.save(returnRequest);
        
        return convertToReturnDetailResponse(returnRequest);
    }

    private Return getReturnForAdmin(Long orderId, Long returnId) {
        // 주문 확인
        orderRepository.findById(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        Return returnRequest = returnRepository.findByIdAndUserIdWithItems(returnId, null)
            .orElseThrow(() -> new CustomException(ErrorCode.RETURN_NOT_FOUND));
        
        // 반품이 해당 주문에 속하는지 확인
        if (!returnRequest.getOrderId().equals(orderId)) {
            throw new CustomException(ErrorCode.RETURN_NOT_FOUND);
        }
        
        return returnRequest;
    }

    private void validateReturnEligibility(Order order) {
        // 배송 완료된 주문만 반품 가능
        if (!order.isDelivered()) {
            throw new CustomException(ErrorCode.RETURN_NOT_AVAILABLE);
        }
        
        // 반품 기간 확인 (배송 완료 후 7일)
        LocalDateTime returnDeadline = order.getUpdateTime().plusDays(RETURN_PERIOD_DAYS);
        if (LocalDateTime.now().isAfter(returnDeadline)) {
            throw new CustomException(ErrorCode.RETURN_PERIOD_EXPIRED);
        }
    }

    private List<OrderItem> validateReturnItems(List<ReturnCreateRequest.ReturnItemRequest> returnItemRequests, Long orderId) {
        List<Long> orderItemIds = returnItemRequests.stream()
            .map(ReturnCreateRequest.ReturnItemRequest::getOrderItemId)
            .collect(Collectors.toList());
        
        List<OrderItem> orderItems = orderItemRepository.findAllById(orderItemIds);
        
        if (orderItems.size() != returnItemRequests.size()) {
            throw new CustomException(ErrorCode.ORDER_NOT_FOUND);
        }
        
        // 주문 아이템이 해당 주문에 속하는지 확인
        boolean allItemsBelongToOrder = orderItems.stream()
            .allMatch(item -> item.getOrderId().equals(orderId));
        
        if (!allItemsBelongToOrder) {
            throw new CustomException(ErrorCode.INVALID_REQUEST);
        }
        
        // 반품 수량 검증
        for (ReturnCreateRequest.ReturnItemRequest returnItemRequest : returnItemRequests) {
            OrderItem orderItem = orderItems.stream()
                .filter(oi -> oi.getId().equals(returnItemRequest.getOrderItemId()))
                .findFirst()
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
            
            Integer returnableQuantity = returnItemRepository.getReturnableQuantityForOrderItem(orderItem.getId());
            if (returnableQuantity == null) {
                returnableQuantity = orderItem.getQuantity();
            }
            
            if (returnItemRequest.getQuantity() > returnableQuantity) {
                throw new CustomException(ErrorCode.INVALID_RETURN_QUANTITY);
            }
        }
        
        return orderItems;
    }

    private void restoreProductStockFromReturn(List<ReturnItem> returnItems) {
        for (ReturnItem returnItem : returnItems) {
            Product product = returnItem.getProduct();
            if (product != null) {
                product.increaseStock(returnItem.getQuantity());
                productRepository.save(product);
            }
        }
    }

    private ReturnDetailResponse convertToReturnDetailResponse(Return returnRequest) {
        return ReturnDetailResponse.builder()
            .id(returnRequest.getId())
            .orderId(returnRequest.getOrderId())
            .userId(returnRequest.getUserId())
            .reason(returnRequest.getReason())
            .detailedReason(returnRequest.getDetailedReason())
            .status(returnRequest.getStatus())
            .returnAmount(returnRequest.getReturnAmount())
            .collectionAddress(returnRequest.getCollectionAddress())
            .trackingNumber(returnRequest.getTrackingNumber())
            .adminMemo(returnRequest.getAdminMemo())
            .rejectionReason(returnRequest.getRejectionReason())
            .refundMethod(returnRequest.getRefundMethod())
            .createTime(returnRequest.getCreateTime())
            .updateTime(returnRequest.getUpdateTime())
            .processedAt(returnRequest.getProcessedAt())
            .refundedAt(returnRequest.getRefundedAt())
            .orderInfo(buildOrderSummaryForReturn(returnRequest.getOrder()))
            .returnItems(buildReturnItemInfos(returnRequest.getReturnItems()))
            .build();
    }

    private ReturnDetailResponse.OrderSummary buildOrderSummaryForReturn(Order order) {
        if (order == null) return null;
        
        return ReturnDetailResponse.OrderSummary.builder()
            .orderId(order.getId())
            .orderDate(order.getCreateTime())
            .receiverName(order.getReceiverName())
            .totalAmount(order.getTotalAmount())
            .build();
    }

    private List<ReturnDetailResponse.ReturnItemInfo> buildReturnItemInfos(List<ReturnItem> returnItems) {
        if (returnItems == null) return null;
        
        return returnItems.stream()
            .map(item -> ReturnDetailResponse.ReturnItemInfo.builder()
                .id(item.getId())
                .orderItemId(item.getOrderItemId())
                .productId(item.getProductId())
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .productImage(item.getProduct() != null ? item.getProduct().getImageUrl() : null)
                .brand(item.getProduct() != null ? item.getProduct().getBrand() : null)
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .returnAmount(item.getReturnAmount())
                .conditionNote(item.getConditionNote())
                .build())
            .collect(Collectors.toList());
    }

    // ==================== 리뷰 관련 메소드 ====================

    public ReviewDetailResponse getOrderReview(Long orderId, Long userId) {
        // 주문 권한 확인
        orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 해당 주문의 리뷰 조회 (없으면 404)
        Review review = reviewRepository.findByOrderIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
        
        return convertToReviewDetailResponse(review, userId);
    }

    @Transactional
    public ReviewDetailResponse createReview(Long orderId, Long userId, ReviewCreateRequest request) {
        // 1. 사용자 검증
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        // 2. 주문 검증
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 3. 주문 아이템 검증
        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 4. 주문 아이템이 해당 주문에 속하는지 확인
        if (!orderItem.getOrderId().equals(orderId)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST);
        }
        
        // 5. 리뷰 작성 가능 조건 검증
        validateReviewEligibility(order, orderItem, userId);
        
        // 6. 이미 리뷰가 있는지 확인
        if (reviewRepository.existsByOrderItemIdAndUserId(orderItem.getId(), userId)) {
            throw new CustomException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }
        
        // 7. 리뷰 생성
        Review review = Review.builder()
            .orderId(orderId)
            .orderItemId(orderItem.getId())
            .productId(orderItem.getProductId())
            .userId(userId)
            .rating(request.getRating())
            .content(request.getContent())
            .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : List.of())
            .isAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false)
            .build();
        
        Review savedReview = reviewRepository.save(review);
        
        return convertToReviewDetailResponse(savedReview, userId);
    }

    @Transactional
    public ReviewDetailResponse updateOrderReview(Long orderId, Long userId, ReviewUpdateRequest request) {
        // 주문 권한 확인
        orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 해당 주문의 리뷰 조회
        Review review = reviewRepository.findByOrderIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
        
        review.updateReview(
            request.getRating(),
            request.getContent(),
            request.getImageUrls(),
            request.getIsAnonymous()
        );
        
        reviewRepository.save(review);
        
        return convertToReviewDetailResponse(review, userId);
    }

    @Transactional
    public void deleteOrderReview(Long orderId, Long userId) {
        // 주문 권한 확인
        orderRepository.findByIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 해당 주문의 리뷰 조회
        Review review = reviewRepository.findByOrderIdAndUserId(orderId, userId)
            .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
        
        // 관련 도움이 됨 데이터 삭제
        reviewHelpfulRepository.deleteByReviewId(review.getId());
        
        reviewRepository.delete(review);
    }

    @Transactional
    public ReviewDetailResponse addHelpfulToOrderReview(Long orderId, Long userId) {
        // 주문 확인 (다른 사용자의 리뷰에도 도움이 됨을 누를 수 있음)
        orderRepository.findById(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 해당 주문의 리뷰 조회 - 주문당 최대 1개의 리뷰만 있으므로 단순 조회
        Review orderReview = reviewRepository.findByOrderId(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
        
        // 이미 도움이 됨을 눌렀는지 확인
        if (reviewHelpfulRepository.findByReviewIdAndUserId(orderReview.getId(), userId).isPresent()) {
            throw new CustomException(ErrorCode.REVIEW_ALREADY_HELPFUL);
        }
        
        // 도움이 됨 추가
        ReviewHelpful reviewHelpful = ReviewHelpful.builder()
            .reviewId(orderReview.getId())
            .userId(userId)
            .build();
        
        reviewHelpfulRepository.save(reviewHelpful);
        
        // 리뷰의 도움이 됨 카운트 증가
        orderReview.addHelpfulCount();
        reviewRepository.save(orderReview);
        
        return convertToReviewDetailResponse(orderReview, userId);
    }

    @Transactional
    public ReviewDetailResponse removeHelpfulFromOrderReview(Long orderId, Long userId) {
        // 주문 확인
        orderRepository.findById(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 해당 주문의 리뷰 조회 - 주문당 최대 1개의 리뷰만 있으므로 단순 조회
        Review orderReview = reviewRepository.findByOrderId(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
        
        // 도움이 됨을 눌렀는지 확인
        ReviewHelpful reviewHelpful = reviewHelpfulRepository.findByReviewIdAndUserId(orderReview.getId(), userId)
            .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_HELPFUL));
        
        // 도움이 됨 제거
        reviewHelpfulRepository.delete(reviewHelpful);
        
        // 리뷰의 도움이 됨 카운트 감소
        orderReview.subtractHelpfulCount();
        reviewRepository.save(orderReview);
        
        return convertToReviewDetailResponse(orderReview, userId);
    }

    @Transactional
    public ReviewDetailResponse addAdminReplyToOrderReview(Long orderId, AdminReplyRequest request) {
        // 주문 확인
        orderRepository.findById(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 해당 주문의 리뷰 조회 - 주문당 최대 1개의 리뷰만 있으므로 단순 조회
        Review orderReview = reviewRepository.findByOrderId(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
        
        orderReview.addAdminReply(request.getAdminReply());
        reviewRepository.save(orderReview);
        
        return convertToReviewDetailResponse(orderReview, null);
    }

    @Transactional
    public ReviewDetailResponse updateAdminReplyToOrderReview(Long orderId, AdminReplyRequest request) {
        // 주문 확인
        orderRepository.findById(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 해당 주문의 리뷰 조회 - 주문당 최대 1개의 리뷰만 있으므로 단순 조회
        Review orderReview = reviewRepository.findByOrderId(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
        
        orderReview.updateAdminReply(request.getAdminReply());
        reviewRepository.save(orderReview);
        
        return convertToReviewDetailResponse(orderReview, null);
    }

    @Transactional
    public void deleteAdminReplyFromOrderReview(Long orderId) {
        // 주문 확인
        orderRepository.findById(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
        
        // 해당 주문의 리뷰 조회 - 주문당 최대 1개의 리뷰만 있으므로 단순 조회
        Review orderReview = reviewRepository.findByOrderId(orderId)
            .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));
        
        orderReview.removeAdminReply();
        reviewRepository.save(orderReview);
    }

    private void validateReviewEligibility(Order order, OrderItem orderItem, Long userId) {
        // 배송 완료된 주문만 리뷰 작성 가능
        if (!order.isDelivered()) {
            throw new CustomException(ErrorCode.REVIEW_NOT_AVAILABLE);
        }
        
        // 리뷰 작성 기간 확인 (배송 완료 후 30일)
        LocalDateTime reviewDeadline = order.getUpdateTime().plusDays(REVIEW_PERIOD_DAYS);
        if (LocalDateTime.now().isAfter(reviewDeadline)) {
            throw new CustomException(ErrorCode.REVIEW_PERIOD_EXPIRED);
        }
        
        // 상품이 활성 상태인지 확인
        Product product = orderItem.getProduct();
        if (product == null || !product.isActive()) {
            throw new CustomException(ErrorCode.REVIEW_NOT_AVAILABLE);
        }
    }

    private ReviewDetailResponse convertToReviewDetailResponse(Review review, Long currentUserId) {
        // 현재 사용자가 도움이 됨을 눌렀는지 확인
        Boolean isHelpful = null;
        if (currentUserId != null) {
            isHelpful = reviewHelpfulRepository.findByReviewIdAndUserId(review.getId(), currentUserId).isPresent();
        }
        
        return ReviewDetailResponse.builder()
            .id(review.getId())
            .orderId(review.getOrderId())
            .orderItemId(review.getOrderItemId())
            .productId(review.getProductId())
            .userId(review.getUserId())
            .rating(review.getRating())
            .content(review.getContent())
            .imageUrls(review.getImageUrls())
            .isAnonymous(review.getIsAnonymous())
            .helpfulCount(review.getHelpfulCount())
            .adminReply(review.getAdminReply())
            .adminReplyDate(review.getAdminReplyDate())
            .createTime(review.getCreateTime())
            .updateTime(review.getUpdateTime())
            .productInfo(buildProductInfoForReview(review.getProduct()))
            .reviewerInfo(buildReviewerInfo(review.getUser(), review.getIsAnonymous()))
            .isHelpful(isHelpful)
            .build();
    }

    private ReviewDetailResponse.ProductInfo buildProductInfoForReview(Product product) {
        if (product == null) return null;
        
        return ReviewDetailResponse.ProductInfo.builder()
            .productId(product.getId())
            .productName(product.getName())
            .productImage(product.getImageUrl())
            .brand(product.getBrand())
            .build();
    }

    private ReviewDetailResponse.ReviewerInfo buildReviewerInfo(User user, Boolean isAnonymous) {
        if (user == null) return null;
        
        // 익명 리뷰인 경우 사용자 정보 마스킹
        if (isAnonymous != null && isAnonymous) {
            return ReviewDetailResponse.ReviewerInfo.builder()
                .userId(null)
                .username("익명")
                .profileImage(null)
                .isAnonymous(true)
                .totalReviewCount(null)
                .build();
        }
        
        // 사용자 리뷰 개수 조회
        long totalReviewCount = reviewRepository.countByUserId(user.getId());
        
        return ReviewDetailResponse.ReviewerInfo.builder()
            .userId(user.getId())
            .username(user.getName())
            .profileImage(user.getProfileImageUrl())
            .isAnonymous(false)
            .totalReviewCount(totalReviewCount)
            .build();
    }
}