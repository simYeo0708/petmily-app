package com.petmily.backend.api.mall.service;

import com.petmily.backend.api.exception.CustomException;
import com.petmily.backend.api.exception.ErrorCode;
import com.petmily.backend.api.mall.dto.subscription.request.SubscriptionCreateRequest;
import com.petmily.backend.api.mall.dto.subscription.request.SubscriptionUpdateRequest;
import com.petmily.backend.api.mall.dto.subscription.response.SubscriptionResponse;
import com.petmily.backend.domain.mall.order.entity.DeliveryInfo;
import com.petmily.backend.domain.mall.product.entity.Product;
import com.petmily.backend.domain.mall.product.repository.ProductRepository;
import com.petmily.backend.domain.mall.subscription.entity.Subscription;
import com.petmily.backend.domain.mall.subscription.entity.SubscriptionStatus;
import com.petmily.backend.domain.mall.subscription.repository.SubscriptionRepository;
import com.petmily.backend.domain.user.entity.User;
import com.petmily.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    private Subscription getSubscriptionById(Long subscriptionId) {
        return subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new CustomException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
    }

    public Page<SubscriptionResponse> getMySubscriptions(Long userId, SubscriptionStatus status, Pageable pageable) {
        User user = getUserById(userId);

        Page<Subscription> subscriptions;
        if(status != null) {
            subscriptions = subscriptionRepository.findByUserAndStatus(user, status, pageable);
        } else {
            subscriptions = subscriptionRepository.findByUser(user, pageable);
        }

        return subscriptions.map(SubscriptionResponse::from);
    }

    public SubscriptionResponse getSubscription(Long userId, Long subscriptionId) {
        User user = getUserById(userId);
        Subscription subscription = getSubscriptionById(subscriptionId);

        if(!subscription.getUser().getId().equals(user.getId())){
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        return SubscriptionResponse.from(subscription);
    }

    @Transactional
    public SubscriptionResponse updateSubscription(Long userId, Long subscriptionId, SubscriptionUpdateRequest request) {
        User user = getUserById(userId);;
        Subscription subscription = getSubscriptionById(subscriptionId);

        if(!subscription.getUser().getId().equals(userId)){
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        if(subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new IllegalStateException("활성 상태의 구독만 수정할 수 있습니다.");
        }

        if(request.getRecipientName() != null) {
            subscription.getDeliveryInfo().setRecipientName(request.getRecipientName());
        }
        if(request.getRecipientPhone() != null) {
            subscription.getDeliveryInfo().setRecipientPhone(request.getRecipientPhone());
        }
        if(request.getDeliveryAddress() != null) {
            subscription.getDeliveryInfo().setDeliveryAddress(request.getDeliveryAddress());
        }
        if(request.getDeliveryMessage() != null) {
            subscription.getDeliveryInfo().setDeliveryMessage(request.getDeliveryMessage());
        }

        if(request.getQuantity() != null) {
            if(subscription.getProduct().getStockQuantity() < request.getQuantity()) {
                throw new CustomException(ErrorCode.INSUFFICIENT_STOCK);
            }
            subscription.setQuantity(request.getQuantity());
        }

        return SubscriptionResponse.from(subscription);
    }

    @Transactional
    public SubscriptionResponse pauseSubscription(Long userId, Long subscriptionId) {
        User user = getUserById(userId);
        Subscription subscription = getSubscriptionById(subscriptionId);

        if(!subscription.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        subscription.pause();
        return SubscriptionResponse.from(subscription);
    }

    @Transactional
    public SubscriptionResponse resumeSubscription(Long userId, Long subscriptionId) {
        User user = getUserById(userId);
        Subscription subscription = getSubscriptionById(subscriptionId);

        if(!subscription.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        subscription.resume();
        return SubscriptionResponse.from(subscription);
    }

    @Transactional
    public void cancelSubscription(Long userId, Long subscriptionId, String reason) {
        User user = getUserById(userId);
        Subscription subscription = getSubscriptionById(subscriptionId);

        if(!subscription.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        subscription.cancel(reason);
    }

    @Transactional
    public SubscriptionResponse skipNextDelivery(Long userId, Long subscriptionId) {
        User user = getUserById(userId);
        Subscription subscription = getSubscriptionById(subscriptionId);

        if(!subscription.getUser().getId().equals(userId)){
            throw new CustomException(ErrorCode.NO_ACCESS);
        }

        subscription.skipNextDelivery();
        return SubscriptionResponse.from(subscription);
    }

}
