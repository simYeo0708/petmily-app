package com.petmily.backend.api.mall.scheduler;

import com.petmily.backend.api.notification.service.NotificationService;
import com.petmily.backend.domain.mall.order.entity.Order;
import com.petmily.backend.domain.mall.order.entity.OrderItem;
import com.petmily.backend.domain.mall.order.entity.OrderStatus;
import com.petmily.backend.domain.mall.order.repository.OrderRepository;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.entity.ProductStatus;
import com.petmily.backend.domain.mall.subscription.entity.Subscription;
import com.petmily.backend.domain.mall.subscription.entity.SubscriptionStatus;
import com.petmily.backend.domain.mall.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionScheduler {

    private final SubscriptionRepository subscriptionRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    /**
     * 매일 오전 9시에 실행
     * 오늘이 배송일인 활성 정기배송을 찾아서 자동으로 주문 생성
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void processSubscriptionDeliveries() {
        log.info("정기배송 자동 주문 처리 시작");

        LocalDate today = LocalDate.now();
        List<Subscription> subscriptions = subscriptionRepository
                .findByStatusAndNextDeliveryDate(SubscriptionStatus.ACTIVE, today);

        log.info("오늘 처리할 정기배송 개수: {}", subscriptions.size());

        for(Subscription subscription : subscriptions) {
            try{
                processSubscriptionDelivery(subscription);
            } catch(Exception e) {
                log.error("정기배송 처리 실패 - subscriptionId: {}, error: {}",
                        subscription.getId(), e.getMessage());
            }
        }
        log.info("정기배송 자동 주문 처리 완료");
    }

    private void processSubscriptionDelivery(Subscription subscription) {
        Product product = subscription.getProduct();

        if(product.getStatus() != ProductStatus.ACTIVE) {
            log.warn("상품이 판매 중지 상태 - productId: {}, subscriptionId: {}",
                    product.getId(), subscription.getId());
            subscription.pause();
            notificationService.sendSubscriptionPausedNotification(subscription, "상품이 판매 중지되었습니다.");
            return;
        }

        if(product.getStockQuantity() < subscription.getQuantity()) {
            log.warn("재고 부족 - productId: {}, required: {}, available: {}",
                    product.getId(), subscription.getQuantity(), product.getStockQuantity());
            subscription.pause();
            notificationService.sendSubscriptionPausedNotification(subscription, "재고가 부족합니다.");
            return;
        }

        log.info("가상 결제 처리 - subscriptionId: {}, amount: {}",
                subscription.getId(), subscription.calculateCurrentPrice());

        product.decreaseStock(subscription.getQuantity());

        Order order = createAutoOrder(subscription);
        orderRepository.save(order);

        product.increaseSalesCount(subscription.getQuantity());

        subscription.completeDelivery();

        notificationService.sendSubscriptionOrderCreatedNotification(order, subscription);

        log.info("정기배송 주문 생성 완료 - orderId: {}, subscriptionId: {}",
                order.getId(), subscription.getId());
    }

    private Order createAutoOrder(Subscription subscription) {
        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(subscription.getUser())
                .status(OrderStatus.PAID)
                .deliveryInfo(subscription.getDeliveryInfo())
                .subscription(subscription)
                .orderedAt(LocalDateTime.now())
                .paidAt(LocalDateTime.now())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal discountedPrice = subscription.calculateCurrentPrice()
                .divide(BigDecimal.valueOf(subscription.getQuantity()), 2, BigDecimal.ROUND_HALF_UP);

        OrderItem orderItem = OrderItem.builder()
                .product(subscription.getProduct())
                .quantity(subscription.getQuantity())
                .price(discountedPrice)
                .build();
        orderItem.calculateTotalPrice();

        order.addOrderItem(orderItem);
        order.setTotalAmount(orderItem.getTotalPrice());

        return order;
    }

    private String generateOrderNumber() {
        String date = LocalDateTime.now().toString().substring(0, 10).replace("-", "");
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "SUB-" + date + "-" + uuid;
    }

}
